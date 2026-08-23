import cds from '@sap/cds'
import { describe, it, expect } from 'vitest'
import path from 'node:path'

const projectRoot = path.resolve(__dirname, '..')
const { test } = cds.test(projectRoot)

describe('Spacefarers - Authentication', () => {
    it('rejects unauthenticated requests', async () => {
        try {
            await test.get('/odata/v4/galactic/Spacefarers')
            expect.fail('Expected request to be rejected')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            expect(message).to.include('401')
        }
    })

    it('only shows Bob (Earth) his own planet records', async () => {
        const response = await test.get('/odata/v4/galactic/Spacefarers', {
            auth: { username: 'bob', password: 'bob' },
        })

        expect(response.status).to.equal(200)
        expect(response.data.value.length).to.equal(2) // ! 2 Earth records in CSV dataset, needs adjustments, but works for now
        for (const record of response.data.value) {
            expect(record.originPlanet).to.equal('Earth')
        }
    })

    it('only shows Zork (Mars) his own planet records', async () => {
        const response = await test.get('/odata/v4/galactic/Spacefarers', {
            auth: { username: 'zork', password: 'zork' },
        })

        expect(response.status).to.equal(200)
        for (const record of response.data.value) {
            expect(record.originPlanet).to.equal('Mars')
        }
    })

    it('lets MissionControl (Alice) see all planets', async () => {
        const response = await test.get('/odata/v4/galactic/Spacefarers', {
            auth: { username: 'alice', password: 'alice' },
        })

        expect(response.status).to.equal(200)
        expect(response.data.value.length).to.equal(4) // ! full CSV dataset, needs adjustments, but works for now
    })

    it('lets Bob edit his own record', async () => {
        const response = await test.patch(
            '/odata/v4/galactic/Spacefarers(11111111-1111-1111-1111-111111111111)',
            { position: 'Fleet Admiral' },
            { auth: { username: 'bob', password: 'bob' } },
        )
        expect(response.status).to.equal(200)
    })

    it("blocks Bob from editing someone else's record", async () => {
        try {
            await test.patch(
                '/odata/v4/galactic/Spacefarers(22222222-2222-2222-2222-222222222222)',
                { position: 'Hijacked' },
                { auth: { username: 'bob', password: 'bob' } },
            )
            expect.fail('Expected update to be rejected')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            expect(message).to.include('403')
        }
    })

    it('lets a Spacefarer self-create a record, owned by themself', async () => {
        const response = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'New Recruit',
                email: 'newrecruit@earth.test',
                age: 30,
                originPlanet: 'Earth',
                destinationPlanet: 'Mars',
            },
            { auth: { username: 'bob', password: 'bob' } },
        )

        expect(response.status).to.equal(201)
        expect(response.data.owner).to.equal('bob')
    })

    it('ignores a client-supplied owner and forces it to the authenticated user', async () => {
        const response = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Sneaky Recruit',
                email: 'sneaky@earth.test',
                age: 30,
                originPlanet: 'Earth',
                destinationPlanet: 'Mars',
                owner: 'zork', // attempting to spoof ownership
            },
            { auth: { username: 'bob', password: 'bob' } },
        )

        expect(response.status).to.equal(201)
        expect(response.data.owner).to.equal('bob') // not 'zork'
    })
})
