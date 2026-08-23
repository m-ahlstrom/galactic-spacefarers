import cds from '@sap/cds'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(__dirname, '..')
const { test } = cds.test(projectRoot)

const missionControl = { auth: { username: 'alice', password: 'alice' } }

describe('Spacefarers - CREATE', () => {
    it('creates a valid Spacefarer', async () => {
        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Test Spacefarer',
                email: 'test@example.com',
                age: 35,
                stardustCollection: 500,
                wormholeNavigationSkill: 80,
                originPlanet: 'Mars',
                destinationPlanet: 'Europa',
                spacesuitColor: 'Blue',
                department: 'Exploration',
                position: 'Navigator',
            },
            missionControl,
        )

        expect(draft.status).to.equal(201)
        expect(draft.data.IsActiveEntity).to.equal(false)

        const response = await test.post(
            `/odata/v4/galactic/Spacefarers(ID=${draft.data.ID},IsActiveEntity=false)/GalacticService.draftActivate`,
            {},
            missionControl,
        )

        expect(response.status).to.equal(201)

        expect(response.data).to.containSubset({
            name: 'Test Spacefarer',
            email: 'test@example.com',
            age: 35,
            stardustCollection: 500,
            wormholeNavigationSkill: 80,
            originPlanet: 'Mars',
            destinationPlanet: 'Europa',
            spacesuitColor: 'Blue',
            department: 'Exploration',
            position: 'Navigator',
            owner: 'alice',
        })

        expect(response.data.ID).to.be.a('string')
    })
})

it('rejects negative stardust collection on save', async () => {
    const draft = await test.post(
        '/odata/v4/galactic/Spacefarers',
        {
            name: 'Negative Stardust',
            email: 'negative.stardust@example.com',
            age: 35,
            stardustCollection: -100,
            wormholeNavigationSkill: 80,
            originPlanet: 'Mars',
            destinationPlanet: 'Europa',
        },
        missionControl,
    )
    expect(draft.status).to.equal(201)

    let didThrow = false
    try {
        await test.post(
            `/odata/v4/galactic/Spacefarers(ID=${draft.data.ID},IsActiveEntity=false)/GalacticService.draftActivate`,
            {},
            missionControl,
        )
    } catch (err: unknown) {
        didThrow = true
        const message = err instanceof Error ? err.message : String(err)
        expect(message).to.include('400')
        expect(message).to.include('Stardust collection cannot be negative.')
    }
    expect(didThrow, 'Expected activation to be rejected').to.equal(true)
})
