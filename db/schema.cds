namespace galactic.spacefarer;

using { cuid, managed } from '@sap/cds/common';

entity Spacefarers : cuid, managed {

    name                             : String(100) not null;

    email                            : String(150) not null;

    age                              : Integer not null;

    stardustCollection               : Integer default 0;

    wormholeNavigationSkill          : Integer default 1;

    originPlanet                     : String(100) not null;

    destinationPlanet                : String(100) not null;

    spacesuitColor                   : String(50) default 'Cosmic Blue';

    department                       : String(100);

    position                         : String(100);

    owner                            : String(100) @cds.on.insert: $user; // login username this record belongs to

    virtual restrictedFieldsReadOnly : Boolean;
}

// ID, createdAt, createdBy, modifiedAt and modifiedBy automatically handled by CAP.
