using { galactic.spacefarer as db } from '../db/schema';

@requires: 'authenticated-user'
service GalacticService {
    @restrict: [
        { grant: 'READ',
            to: 'Spacefarer',
            where: 'originPlanet.name = $user.planet' },
        { grant: ['CREATE', 'UPDATE'],
            to: 'Spacefarer',
            where: 'owner = $user' },
        { grant: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
            to: 'MissionControl' }
    ]
    entity Spacefarers as projection on db.Spacefarers;

    @readonly
    entity Planets as projection on db.Planets;

    @readonly
    entity Departments as projection on db.Departments;

    @readonly
    entity Positions as projection on db.Positions;
}

annotate GalacticService.Spacefarers with @odata.draft.enabled;
