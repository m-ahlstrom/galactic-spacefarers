import cds from '@sap/cds'
import validateSpacefarer from './lib/validate-function'
import validatePlanetAccess from './lib/validate-planet-access'
import validateSpacesuitColor from './lib/validate-spacesuit-color'
import sendMail from './lib/send-mail'
import buildWelcomeEmailHtml from './lib/email-template'

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
            if (req.data.stardustCollection === undefined)
                req.data.stardustCollection = 0
            if (req.data.wormholeNavigationSkill === undefined)
                req.data.wormholeNavigationSkill = 1
        })

        this.before('UPDATE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, false)
            await validatePlanetAccess(req.data, req)
            await validateSpacesuitColor(req.data, req)
        })

        this.before('SAVE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, true)
            await validatePlanetAccess(req.data, req)
            await validateSpacesuitColor(req.data, req)

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
            const { Planets, Departments, Positions, SpacesuitColors } =
                cds.entities('galactic.spacefarer')

            const [origin, destination, department, position, spacesuitColor] =
                await Promise.all([
                    SELECT.one
                        .from(Planets)
                        .where({ ID: req.data.originPlanet_ID }),

                    SELECT.one
                        .from(Planets)
                        .where({ ID: req.data.destinationPlanet_ID }),

                    req.data.department_ID
                        ? SELECT.one
                              .from(Departments)
                              .where({ ID: req.data.department_ID })
                        : Promise.resolve(null),

                    req.data.position_ID
                        ? SELECT.one
                              .from(Positions)
                              .where({ ID: req.data.position_ID })
                        : Promise.resolve(null),

                    req.data.spacesuitColor_ID
                        ? SELECT.one
                              .from(SpacesuitColors)
                              .where({ ID: req.data.spacesuitColor_ID })
                        : Promise.resolve(null),
                ])

            const html = buildWelcomeEmailHtml({
                name: req.data.name,
                email: req.data.email,
                age: req.data.age,
                originPlanetName: origin?.name ?? 'an unknown world',
                destinationPlanetName: destination?.name ?? 'parts unknown',
                departmentName: department?.name ?? 'Unassigned',
                positionTitle: position?.title ?? 'Unassigned',
                stardustCollection: req.data.stardustCollection ?? 0,
                wormholeNavigationSkill: req.data.wormholeNavigationSkill ?? 1,
                spacesuitColor: spacesuitColor?.name ?? 'Cosmic Blue',
            })

            await sendMail({
                to: req.data.email,
                subject: `🚀 Welcome aboard, ${req.data.name}!`,
                html,
            })

            req.notify(`Welcome email sent to ${req.data.email}`)
        })

        await super.init()
    }
}
