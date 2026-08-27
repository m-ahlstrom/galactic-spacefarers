export type Auth = {
    auth: {
        username: string
        password: string
    }
}

interface ODataCollectionResponse {
    data: {
        value: Array<Record<string, unknown>>
    }
}

interface TestClient {
    get(url: string, auth?: Auth): Promise<ODataCollectionResponse>
}

export async function lookupId(
    test: TestClient,
    entitySet: 'Planets' | 'Departments' | 'Positions' | 'SpacesuitColors',
    filter: string,
    auth: Auth,
): Promise<string> {
    const response = await test.get(
        `/odata/v4/galactic/${entitySet}?$filter=${encodeURIComponent(filter)}&$top=1`,
        auth,
    )

    if (!response.data.value.length) {
        throw new Error(`No ${entitySet} found matching filter: ${filter}`)
    }

    return response.data.value[0].ID as string
}

export async function lookupRecordId(
    test: TestClient,
    filter: string,
    auth: Auth,
): Promise<string> {
    const response = await test.get(
        `/odata/v4/galactic/Spacefarers?$filter=${encodeURIComponent(filter)}&$top=1`,
        auth,
    )

    if (!response.data.value.length) {
        throw new Error(`No Spacefarer found matching filter: ${filter}`)
    }

    return response.data.value[0].ID as string
}
