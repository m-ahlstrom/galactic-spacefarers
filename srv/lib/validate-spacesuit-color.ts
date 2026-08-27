import cds from '@sap/cds'

interface SpacesuitColorPayload {
    spacesuitColor_ID?: string
    department_ID?: string
    position_ID?: string
}

export default async function validateSpacesuitColor(
    data: SpacesuitColorPayload,
    req: cds.Request,
) {
    if (!data.spacesuitColor_ID) return

    const { DepartmentColorAccess, Positions, SpacesuitColors } = cds.entities(
        'galactic.spacefarer',
    )

    const color = await SELECT.one
        .from(SpacesuitColors)
        .where({ ID: data.spacesuitColor_ID })

    if (!color) {
        req.error(400, 'Spacesuit color does not exist.')
        return
    }

    if (!data.department_ID) {
        req.error(
            403,
            `${color.name} requires a department to be assigned first.`,
        )
        return
    }

    const access = await SELECT.one.from(DepartmentColorAccess).where({
        department_ID: data.department_ID,
        color_ID: data.spacesuitColor_ID,
    })

    if (!access) {
        req.error(403, `${color.name} is not authorized for this department.`)
        return
    }

    let rank = 1
    if (data.position_ID) {
        const position = await SELECT.one
            .from(Positions)
            .where({ ID: data.position_ID })
        rank = position?.rank ?? 1
    }

    if (rank < access.minRank) {
        req.error(
            403,
            `${color.name} requires rank ${access.minRank} or higher in this department.`,
        )
    }
}
