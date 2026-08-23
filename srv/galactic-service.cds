using { galactic.spacefarer as db } from '../db/schema';

@requires: 'authenticated-user'
service GalacticService {

    @restrict: [
        { grant: 'READ',
            to: 'Spacefarer',
            where: 'originPlanet = $user.planet' },
        { grant: ['CREATE', 'UPDATE'],
            to: 'Spacefarer',
            where: 'owner = $user' },
        { grant: ['READ', 'CREATE', 'UPDATE', 'DELETE'],
            to: 'MissionControl' }
    ]
    entity Spacefarers as projection on db.Spacefarers;
}