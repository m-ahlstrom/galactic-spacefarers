import cds from '@sap/cds'
import path from 'node:path'
import { describe, it, expect } from 'vitest'
import { lookupId, lookupRecordId, type Auth } from './helpers'

const projectRoot = path.resolve(__dirname, '..')
const { test } = cds.test(projectRoot)

const missionControl: Auth = {
    auth: {
        username: 'alice',
        password: 'alice',
    },
}

const bobAuth: Auth = {
    auth: {
        username: 'bob',
        password: 'bob',
    },
}

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

    it('only shows Bob (Earth) records with matching origin planet', async () => {
        const groundTruth = await test.get(
            `/odata/v4/galactic/Spacefarers?$filter=${encodeURIComponent("originPlanet/name eq 'Earth'")}&$count=true&$top=0`,
            missionControl,
        )

        const expectedCount = groundTruth.data['@odata.count']

        const response = await test.get(
            '/odata/v4/galactic/Spacefarers?$expand=originPlanet',
            bobAuth,
        )

        expect(response.status).to.equal(200)
        expect(response.data.value.length).to.equal(expectedCount)

        for (const record of response.data.value) {
            expect(record.originPlanet.name).to.equal('Earth')
        }
    })

    it('only shows Zork (Mars) records with matching origin planet', async () => {
        const groundTruth = await test.get(
            `/odata/v4/galactic/Spacefarers?$filter=${encodeURIComponent("originPlanet/name eq 'Mars'")}&$count=true&$top=0`,
            missionControl,
        )

        const expectedCount = groundTruth.data['@odata.count']

        const response = await test.get(
            '/odata/v4/galactic/Spacefarers?$expand=originPlanet',
            {
                auth: {
                    username: 'zork',
                    password: 'zork',
                },
            },
        )

        expect(response.status).to.equal(200)
        expect(response.data.value.length).to.equal(expectedCount)

        for (const record of response.data.value) {
            expect(record.originPlanet.name).to.equal('Mars')
        }
    })

    it('lets MissionControl (Alice) see every record, unrestricted by planet', async () => {
        const totalCount = await test.get(
            '/odata/v4/galactic/Spacefarers?$count=true&$top=0',
            missionControl,
        )

        const response = await test.get(
            '/odata/v4/galactic/Spacefarers',
            missionControl,
        )

        expect(response.status).to.equal(200)
        expect(response.data.value.length).to.equal(
            totalCount.data['@odata.count'],
        )
    })

    it('lets Bob edit his own record', async () => {
        const bobRecordId = await lookupRecordId(
            test,
            "owner eq 'bob'",
            missionControl,
        )

        const venusId = await lookupId(
            test,
            'Planets',
            "name eq 'Venus'",
            missionControl,
        )

        const activeKey = `ID=${bobRecordId},IsActiveEntity=true`
        const draftKey = `ID=${bobRecordId},IsActiveEntity=false`

        const draftEdit = await test.post(
            `/odata/v4/galactic/Spacefarers(${activeKey})/GalacticService.draftEdit`,
            {
                PreserveChanges: true,
            },
            bobAuth,
        )

        expect(draftEdit.status).to.equal(201)

        const patched = await test.patch(
            `/odata/v4/galactic/Spacefarers(${draftKey})`,
            {
                destinationPlanet_ID: venusId,
            },
            bobAuth,
        )

        expect(patched.status).to.equal(200)

        const activated = await test.post(
            `/odata/v4/galactic/Spacefarers(${draftKey})/GalacticService.draftActivate`,
            {},
            bobAuth,
        )

        expect(activated.status).to.equal(200)
        expect(activated.data.destinationPlanet_ID).to.equal(venusId)
    })

    it("blocks Bob from editing someone else's record", async () => {
        const zorkRecordId = await lookupRecordId(
            test,
            "owner eq 'zork'",
            missionControl,
        )

        try {
            await test.post(
                `/odata/v4/galactic/Spacefarers(ID=${zorkRecordId},IsActiveEntity=true)/GalacticService.draftEdit`,
                {
                    PreserveChanges: true,
                },
                bobAuth,
            )

            expect.fail('Expected draftEdit to be rejected')
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err)
            expect(message).to.include('403')
        }
    })

    it('lets a Spacefarer self-create a record, owned by themself', async () => {
        const earthId = await lookupId(
            test,
            'Planets',
            "name eq 'Earth'",
            bobAuth,
        )

        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            bobAuth,
        )

        const explorationId = await lookupId(
            test,
            'Departments',
            "name eq 'Exploration'",
            bobAuth,
        )

        const crimsonId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Crimson'",
            bobAuth,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'New Recruit',
                email: 'newrecruit@earth.test',
                age: 30,
                originPlanet_ID: earthId,
                destinationPlanet_ID: marsId,
                department_ID: explorationId,
                spacesuitColor_ID: crimsonId,
            },
            bobAuth,
        )

        expect(draft.status).to.equal(201)

        const response = await test.post(
            `/odata/v4/galactic/Spacefarers(ID=${draft.data.ID},IsActiveEntity=false)/GalacticService.draftActivate`,
            {},
            bobAuth,
        )

        expect(response.status).to.equal(201)
        expect(response.data.owner).to.equal('bob')
    })

    it('ignores a client-supplied owner and forces it to the authenticated user', async () => {
        const earthId = await lookupId(
            test,
            'Planets',
            "name eq 'Earth'",
            bobAuth,
        )

        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            bobAuth,
        )

        const explorationId = await lookupId(
            test,
            'Departments',
            "name eq 'Exploration'",
            bobAuth,
        )

        const crimsonId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Crimson'",
            bobAuth,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Sneaky Recruit',
                email: 'sneaky@earth.test',
                age: 30,
                originPlanet_ID: earthId,
                destinationPlanet_ID: marsId,
                department_ID: explorationId,
                spacesuitColor_ID: crimsonId,
                owner: 'zork',
            },
            bobAuth,
        )

        expect(draft.status).to.equal(201)

        const response = await test.post(
            `/odata/v4/galactic/Spacefarers(ID=${draft.data.ID},IsActiveEntity=false)/GalacticService.draftActivate`,
            {},
            bobAuth,
        )

        expect(response.status).to.equal(201)
        expect(response.data.owner).to.equal('bob')
    })
})
