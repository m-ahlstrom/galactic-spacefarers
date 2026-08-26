import cds from '@sap/cds'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface SpacefarerPayload {
    age?: number
    originPlanet_ID?: string
    destinationPlanet_ID?: string
    stardustCollection?: number
    wormholeNavigationSkill?: number
    name?: string
    email?: string
    spacesuitColor?: string
}

export default function validateSpacefarer(
    data: SpacefarerPayload,
    req: cds.Request,
    checkRequired: boolean,
) {
    if (checkRequired) {
        if (data.age === undefined || data.age === null) {
            req.error(400, 'Age is required.')
        }
        if (!data.originPlanet_ID) {
            req.error(400, 'Origin planet is required.')
        }
        if (!data.destinationPlanet_ID) {
            req.error(400, 'Destination planet is required.')
        }
        if (!data.name) {
            req.error(400, 'Name is required.')
        }
        if (!data.email) {
            req.error(400, 'Email is required.')
        }
    }

    if (data.age !== undefined && data.age !== null) {
        if (data.age < 25 || data.age > 55) {
            req.error(400, 'Spacefarers must be between 25 and 55 years old.')
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
