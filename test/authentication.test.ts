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
})
