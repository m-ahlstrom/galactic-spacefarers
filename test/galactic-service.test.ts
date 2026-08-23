import cds from '@sap/cds'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const projectRoot = path.resolve(__dirname, '..')
const { test } = cds.test(projectRoot)

const missionControl = { auth: { username: 'alice', password: 'alice' } }

describe('Spacefarers - CREATE', () => {
    it('creates a valid Spacefarer', async () => {
        const response = await test.post(
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

    it('rejects negative stardust collection', async () => {
        try {
            await test.post(
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
            // If we get here, force a failure
            expect.fail('Expected request to be rejected with 400')
        } catch (err: unknown) {
            if (err instanceof Error) {
                expect(err.message).to.include('400')
                expect(err.message).to.include(
                    'Stardust collection cannot be negative.',
                )
            } else {
                expect.fail('Expected an Error instance')
            }
        }
    })
})
