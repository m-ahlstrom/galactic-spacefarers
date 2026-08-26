import cds from '@sap/cds'
import validateSpacefarer from './lib/validate-function'
import validatePlanetAccess from './lib/validate-planet-access'
import sendMockEmail from './lib/mock-mailer'

const missionControlOnlyFields = [
    'originPlanet_ID',
    'age',
    'department_ID',
    'position_ID',
    'wormholeNavigationSkill',
] as const

export default class GalacticService extends cds.ApplicationService {
    async init(): Promise<void> {
        this.before('NEW', 'Spacefarers', async (req) => {
            if (!req.data.spacesuitColor)
                req.data.spacesuitColor = 'Cosmic Blue'
            if (req.data.stardustCollection === undefined)
                req.data.stardustCollection = 0
            if (req.data.wormholeNavigationSkill === undefined)
                req.data.wormholeNavigationSkill = 1
        })

        this.before('UPDATE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, false)
            await validatePlanetAccess(req.data, req)
        })

        this.before('SAVE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, true)
            await validatePlanetAccess(req.data, req)

            if (!req.user.is('MissionControl')) {
                const { Spacefarers } = cds.entities('galactic.spacefarer')
                const existingActiveRecord = await cds.db.run(
                    SELECT.one.from(Spacefarers).where({ ID: req.data.ID }),
                )
                const isNewRecord = !existingActiveRecord

                if (!isNewRecord) {
                    const diff = await (
                        req as unknown as {
                            diff: () => Promise<Record<string, unknown>>
                        }
                    ).diff()
                    const touched = missionControlOnlyFields.filter(
                        (f) => diff[f] !== undefined,
                    )
                    if (touched.length) {
                        req.error(
                            403,
                            `Only Mission Control may change: ${touched.join(', ')}`,
                        )
                    }
                }
            }
        })

        this.after('READ', 'Spacefarers', (data, req) => {
            const isMissionControl = req.user.is('MissionControl')
            const rows = Array.isArray(data) ? data : [data]
            rows.forEach((r) => {
                if (r) r.restrictedFieldsReadOnly = !isMissionControl
            })
        })

        this.after('CREATE', 'Spacefarers', async (_data, req) => {
            const { Planets } = cds.entities('galactic.spacefarer')

            const [origin, destination] = await Promise.all([
                SELECT.one
                    .from(Planets)
                    .where({ ID: req.data.originPlanet_ID }),
                SELECT.one
                    .from(Planets)
                    .where({ ID: req.data.destinationPlanet_ID }),
            ])

            const emailContent = {
                to: req.data.email,
                subject: `🚀 Welcome aboard, ${req.data.name}!`,
                body:
                    `Congratulations, ${req.data.name}! Your cosmic journey from ${origin?.name ?? 'an unknown world'} ` +
                    `to ${destination?.name ?? 'parts unknown'} has been cleared for launch. ` +
                    `Stardust collected so far: ${req.data.stardustCollection}. Safe travels among the stars!`,
            }
            await sendMockEmail(emailContent)
            req.notify(`Welcome email sent to ${req.data.email}`)
        })

        await super.init()
    }
}
