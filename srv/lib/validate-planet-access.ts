import cds from '@sap/cds'

interface PlanetAccessPayload {
    destinationPlanet_ID?: string
    department_ID?: string
}

export default async function validatePlanetAccess(
    data: PlanetAccessPayload,
    req: cds.Request,
) {
    if (!data.destinationPlanet_ID) return

    const { Planets, PlanetAccess } = cds.entities('galactic.spacefarer')

    const planet = await SELECT.one
        .from(Planets)
        .where({ ID: data.destinationPlanet_ID })

    if (!planet) {
        req.error(400, 'Destination planet does not exist.')
        return
    }

    if (!planet.restricted) return

    if (!data.department_ID) {
        req.error(
            403,
            `${planet.name} requires an approved department for travel clearance.`,
        )
        return
    }

    const access = await SELECT.one.from(PlanetAccess).where({
        planet_ID: data.destinationPlanet_ID,
        department_ID: data.department_ID,
    })

    if (!access) {
        req.error(
            403,
            `Your department is not cleared for travel to ${planet.name}.`,
        )
    }
}
