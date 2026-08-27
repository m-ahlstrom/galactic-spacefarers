using {galactic.spacefarer as db} from '../db/schema';

@requires: 'authenticated-user'
service GalacticService {
    @restrict: [
        {
            grant: 'READ',
            to   : 'Spacefarer',
            where: 'originPlanet.name = $user.planet'
        },
        {
            grant: [
                'CREATE',
                'UPDATE'
            ],
            to   : 'Spacefarer',
            where: 'owner = $user'
        },
        {
            grant: [
                'READ',
                'CREATE',
                'UPDATE',
                'DELETE'
            ],
            to   : 'MissionControl'
        }
    ]
    entity Spacefarers              as
        projection on db.Spacefarers {
            *,
            spacesuitColor,
            department,
            originPlanet,
            destinationPlanet,
            position
        };

    @readonly
    entity Planets                  as projection on db.Planets;

    @readonly
    entity SpacesuitColors          as projection on db.SpacesuitColors;

    @readonly
    entity AvailableSpacesuitColors as
        projection on db.DepartmentColorAccess {
            key color.ID      as ID,
                color.name    as name,
                department.ID as department_ID,
                minRank
        };

    @readonly
    entity Departments              as projection on db.Departments;

    @readonly
    entity Positions                as
        projection on db.Positions {
            *,
            title || ' (' || department.name || ')' as displayTitle : String(150)
        };
}

annotate GalacticService.Spacefarers with @odata.draft.enabled;
