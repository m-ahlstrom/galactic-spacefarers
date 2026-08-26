namespace galactic.spacefarer;

using { cuid, managed } from '@sap/cds/common';

entity Departments : cuid {
    name      : String(100) not null;
    positions : Association to many Positions on positions.department = $self;
}

annotate Departments with @assert.unique.name: [name];

entity Positions : cuid {
    title      : String(100) not null;
    rank       : Integer not null;
    department : Association to Departments not null;
}

annotate Positions with @assert.unique.titlePerDepartment: [title, department];

entity Planets : cuid {
    name               : String(100) not null;
    code               : String(10);
    restricted         : Boolean default false;
    allowedDepartments : Association to many PlanetAccess on allowedDepartments.planet = $self;
}

annotate Planets with @assert.unique.name: [name];
annotate Planets with @assert.unique.code: [code];

entity PlanetAccess : cuid {
    planet     : Association to Planets not null;
    department : Association to Departments not null;
}

annotate PlanetAccess with @assert.unique.pairing: [planet, department];

entity Spacefarers : cuid, managed {
    name                             : String(100) not null;
    email                            : String(150) not null;
    age                              : Integer not null;
    stardustCollection               : Integer default 0;
    wormholeNavigationSkill          : Integer default 1;
    originPlanet                     : Association to Planets not null;
    destinationPlanet                : Association to Planets not null;
    spacesuitColor                   : String(50) default 'Cosmic Blue';
    department                       : Association to Departments;
    position                         : Association to Positions;
    owner                            : String(100) @cds.on.insert: $user;
    virtual restrictedFieldsReadOnly : Boolean;
}

annotate Spacefarers with @assert.unique.email: [email];

// ID, createdAt, createdBy, modifiedAt and modifiedBy automatically handled by CAP.