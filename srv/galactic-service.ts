import cds from '@sap/cds'
import { Spacefarers } from '#cds-models/GalacticService'

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SpacefarerPayload {
    age?: number
    originPlanet?: string
    destinationPlanet?: string
    stardustCollection?: number
    wormholeNavigationSkill?: number
    name?: string
    email?: string
    spacesuitColor?: string
}

function validateSpacefarer(
    data: SpacefarerPayload,
    req: cds.Request,
    isCreate: boolean,
) {
    // Required-on-create checks only enforced when the record is being born
    if (isCreate) {
        if (data.age === undefined || data.age === null) {
            req.error(400, 'Age is required.')
        }
        if (!data.originPlanet) {
            req.error(400, 'Origin planet is required.')
        }
        if (!data.destinationPlanet) {
            req.error(400, 'Destination planet is required.')
        }
        if (!data.name) {
            req.error(400, 'Name is required.')
        }
        if (!data.email) {
            req.error(400, 'Email is required.')
        }
    }

    // Range/format checks applied whenever the field is present, whether creating or editing
    if (data.age !== undefined && data.age !== null) {
        if (data.age < 25 || data.age > 55) {
            req.error(400, 'Spacefarers must be between 25 and 55 years old.')
        }
    }

    if (data.originPlanet !== undefined && data.originPlanet !== null) {
        if (!allowedPlanets.includes(data.originPlanet)) {
            req.error(
                400,
                `Origin planet '${data.originPlanet}' is not an approved spacefaring world.`,
            )
        }
    }

    if (
        data.destinationPlanet !== undefined &&
        data.destinationPlanet !== null
    ) {
        if (!allowedPlanets.includes(data.destinationPlanet)) {
            req.error(
                400,
                `Destination planet '${data.destinationPlanet}' is not an approved destination.`,
            )
        }
    }

    if (
        data.stardustCollection !== undefined &&
        data.stardustCollection !== null
    ) {
        if (data.stardustCollection < 0) {
            req.error(400, 'Stardust collection cannot be negative.')
        }
    }

    if (
        data.wormholeNavigationSkill !== undefined &&
        data.wormholeNavigationSkill !== null
    ) {
        if (
            data.wormholeNavigationSkill < 1 ||
            data.wormholeNavigationSkill > 100
        ) {
            req.error(
                400,
                'Wormhole navigation skill must be between 1 and 100.',
            )
        }
    }

    if (data.name !== undefined && data.name !== null) {
        if (data.name.trim() === '') {
            req.error(400, 'Name cannot be empty.')
        }
    }

    if (data.email !== undefined && data.email !== null) {
        if (!emailRegex.test(data.email)) {
            req.error(400, 'Email must be a valid email address.')
        }
    }

    // Secret coffee protocol
    if (data.name === 'I need a coffee') {
        req.error(
            418,
            "Mission Control, we have a problem. The Spacefarer needs coffee, but I'm a teapot.",
        )
    }
}

export default class GalacticService extends cds.ApplicationService {
    async init(): Promise<void> {
        this.before('CREATE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, true)

            // Apply defaults — only relevant at creation time
            if (!req.data.spacesuitColor) {
                req.data.spacesuitColor = 'Cosmic Blue'
            }
            if (req.data.stardustCollection === undefined) {
                req.data.stardustCollection = 0
            }
            if (req.data.wormholeNavigationSkill === undefined) {
                req.data.wormholeNavigationSkill = 1
            }
        })

        this.before('UPDATE', 'Spacefarers', async (req) => {
            validateSpacefarer(req.data, req, false)
        })

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
