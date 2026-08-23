import cds from '@sap/cds'
import { Spacefarers } from '#cds-models/GalacticService'

export default class GalacticService extends cds.ApplicationService {
    async init(): Promise<void> {
        this.before('CREATE', 'Spacefarers', async (req) => {
            const data = req.data

            // Allowed planets / moons

            const allowedPlanets = [
                'Mars',
                'Earth',
                'Venus',
                'Moon',
                'Europa',
                'Enceladus',
                'Titan',
                'Ganymede',
            ]

            // Validate age

            if (data.age === undefined || data.age === null) {
                req.error(400, 'Age is required.')
            }

            if (
                data.age !== undefined &&
                data.age !== null &&
                (data.age < 25 || data.age > 55)
            ) {
                req.error(
                    400,
                    'Spacefarers must be between 25 and 55 years old.',
                )
            }

            // Validate origin planet

            if (!data.originPlanet) {
                req.error(400, 'Origin planet is required.')
            } else if (!allowedPlanets.includes(data.originPlanet)) {
                req.error(
                    400,
                    `Origin planet '${data.originPlanet}' is not an approved spacefaring world.`,
                )
            }

            // Validate destination planet

            if (!data.destinationPlanet) {
                req.error(400, 'Destination planet is required.')
            } else if (!allowedPlanets.includes(data.destinationPlanet)) {
                req.error(
                    400,
                    `Destination planet '${data.destinationPlanet}' is not an approved destination.`,
                )
            }

            // Validate stardust

            if (
                data.stardustCollection !== undefined &&
                data.stardustCollection < 0
            ) {
                req.error(400, 'Stardust collection cannot be negative.')
            }

            // Validate wormhole navigation skill

            if (
                data.wormholeNavigationSkill !== undefined &&
                (data.wormholeNavigationSkill < 1 ||
                    data.wormholeNavigationSkill > 100)
            ) {
                req.error(
                    400,
                    'Wormhole navigation skill must be between 1 and 100.',
                )
            }

            // Secret coffee protocol

            if (data.name === 'I need a coffee') {
                req.error(
                    418,
                    "Mission Control, we have a problem. The Spacefarer needs coffee, but I'm a teapot.",
                )
            }

            // Apply defaults

            if (!data.spacesuitColor) {
                data.spacesuitColor = 'Cosmic Blue'
            }

            if (data.stardustCollection === undefined) {
                data.stardustCollection = 0
            }

            if (data.wormholeNavigationSkill === undefined) {
                data.wormholeNavigationSkill = 1
            }
        })

        // After CREATE

        this.after('CREATE', 'Spacefarers', async (data: Spacefarers, req) => {
            const emailContent = {
                to: req.data.email,
                subject: `🚀 Welcome aboard, ${req.data.name}!`,
                body:
                    `Congratulations, ${req.data.name}! Your cosmic journey from ${req.data.originPlanet} ` +
                    `to ${req.data.destinationPlanet} has been cleared for launch. ` +
                    `Stardust collected so far: ${req.data.stardustCollection}. Safe travels among the stars!`,
            }

            // TODO Simulated send, swap to real mailer later
            console.log('Sending cosmic notification:', emailContent)
        })

        await super.init()
    }
}
