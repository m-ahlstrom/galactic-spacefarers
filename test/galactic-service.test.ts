import cds from '@sap/cds'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { lookupId, type Auth } from './helpers'

const projectRoot = path.resolve(__dirname, '..')
const { test } = cds.test(projectRoot)

const missionControl: Auth = {
    auth: {
        username: 'alice',
        password: 'alice',
    },
}

describe('Spacefarers - CREATE', () => {
    it('creates a valid Spacefarer', async () => {
        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            missionControl,
        )

        const europaId = await lookupId(
            test,
            'Planets',
            "name eq 'Europa'",
            missionControl,
        )

        const explorationId = await lookupId(
            test,
            'Departments',
            "name eq 'Exploration'",
            missionControl,
        )

        const crimsonId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Crimson'",
            missionControl,
        )

        const cadetId = await lookupId(
            test,
            'Positions',
            "title eq 'Cadet' and department/name eq 'Exploration'",
            missionControl,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Test Spacefarer',
                email: 'test@example.com',
                age: 35,
                stardustCollection: 500,
                wormholeNavigationSkill: 80,
                originPlanet_ID: marsId,
                destinationPlanet_ID: europaId,
                spacesuitColor_ID: crimsonId,
                department_ID: explorationId,
                position_ID: cadetId,
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
        expect(response.data.ID).to.be.a('string')

        const expanded = await test.get(
            `/odata/v4/galactic/Spacefarers(ID=${response.data.ID},IsActiveEntity=true)` +
                `?$expand=originPlanet,destinationPlanet,department,position,spacesuitColor`,
            missionControl,
        )

        expect(expanded.data).to.containSubset({
            name: 'Test Spacefarer',
            email: 'test@example.com',
            age: 35,
            stardustCollection: 500,
            wormholeNavigationSkill: 80,
            owner: 'alice',

            originPlanet: {
                name: 'Mars',
            },

            destinationPlanet: {
                name: 'Europa',
            },

            department: {
                name: 'Exploration',
            },

            position: {
                title: 'Cadet',
            },

            spacesuitColor: {
                name: 'Crimson',
            },
        })
    })

    it('rejects negative stardust collection on save', async () => {
        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            missionControl,
        )

        const europaId = await lookupId(
            test,
            'Planets',
            "name eq 'Europa'",
            missionControl,
        )

        const explorationId = await lookupId(
            test,
            'Departments',
            "name eq 'Exploration'",
            missionControl,
        )

        const crimsonId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Crimson'",
            missionControl,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Negative Stardust',
                email: 'negative.stardust@example.com',
                age: 35,
                stardustCollection: -100,
                wormholeNavigationSkill: 80,
                originPlanet_ID: marsId,
                destinationPlanet_ID: europaId,
                department_ID: explorationId,
                spacesuitColor_ID: crimsonId,
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
            expect(message).to.include(
                'Stardust collection cannot be negative.',
            )
        }

        expect(didThrow, 'Expected activation to be rejected').to.equal(true)
    })

    it('rejects an uncleared department traveling to a restricted planet', async () => {
        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            missionControl,
        )

        const enceladusId = await lookupId(
            test,
            'Planets',
            "name eq 'Enceladus'",
            missionControl,
        )

        const navigationId = await lookupId(
            test,
            'Departments',
            "name eq 'Navigation'",
            missionControl,
        )

        const ivoryWhiteId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Ivory White'",
            missionControl,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Unauthorized Traveler',
                email: 'unauthorized@example.com',
                age: 30,
                originPlanet_ID: marsId,
                destinationPlanet_ID: enceladusId,
                department_ID: navigationId,
                spacesuitColor_ID: ivoryWhiteId,
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

            expect(message).to.include('403')
            expect(message).to.include('not cleared for travel')
        }

        expect(didThrow, 'Expected activation to be rejected').to.equal(true)
    })

    it('allows a cleared department to travel to a restricted planet', async () => {
        const marsId = await lookupId(
            test,
            'Planets',
            "name eq 'Mars'",
            missionControl,
        )

        const enceladusId = await lookupId(
            test,
            'Planets',
            "name eq 'Enceladus'",
            missionControl,
        )

        const scienceId = await lookupId(
            test,
            'Departments',
            "name eq 'Science'",
            missionControl,
        )

        const cosmicBlueId = await lookupId(
            test,
            'SpacesuitColors',
            "name eq 'Cosmic Blue'",
            missionControl,
        )

        const draft = await test.post(
            '/odata/v4/galactic/Spacefarers',
            {
                name: 'Cleared Traveler',
                email: 'cleared@example.com',
                age: 30,
                originPlanet_ID: marsId,
                destinationPlanet_ID: enceladusId,
                department_ID: scienceId,
                spacesuitColor_ID: cosmicBlueId,
            },
            missionControl,
        )

        expect(draft.status).to.equal(201)

        const response = await test.post(
            `/odata/v4/galactic/Spacefarers(ID=${draft.data.ID},IsActiveEntity=false)/GalacticService.draftActivate`,
            {},
            missionControl,
        )

        expect(response.status).to.equal(201)

        const expanded = await test.get(
            `/odata/v4/galactic/Spacefarers(ID=${response.data.ID},IsActiveEntity=true)` +
                `?$expand=destinationPlanet,department,spacesuitColor`,
            missionControl,
        )

        expect(expanded.data.destinationPlanet.name).to.equal('Enceladus')
        expect(expanded.data.department.name).to.equal('Science')
        expect(expanded.data.spacesuitColor.name).to.equal('Cosmic Blue')
    })
})
