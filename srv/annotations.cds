using GalacticService as service from './galactic-service';

annotate service.Spacefarers with @(UI: {
    HeaderInfo            : {
        TypeName      : 'Spacefarer',
        TypeNamePlural: 'Spacefarers',
        Title         : {Value: name},
        Description   : {Value: originPlanet.name}
    },

    LineItem              : [
        {
            Value: name,
            Label: 'Name'
        },
        {
            Value: originPlanet.name,
            Label: 'Origin Planet'
        },
        {
            Value: destinationPlanet.name,
            Label: 'Destination Planet'
        },
        {
            Value: stardustCollection,
            Label: 'Stardust Collection'
        },
        {
            Value: wormholeNavigationSkill,
            Label: 'Wormhole Nav. Skill'
        },
        {
            Value: spacesuitColor,
            Label: 'Spacesuit Color'
        },
        {
            Value: department.name,
            Label: 'Department'
        },
        {
            Value: position.title,
            Label: 'Position'
        }
    ],

    SelectionFields       : [
        originPlanet_ID,
        destinationPlanet_ID,
        spacesuitColor,
        department_ID,
        position_ID
    ],

    Facets                : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'General Information',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Cosmic Journey',
            Target: '@UI.FieldGroup#Journey'
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Cosmic Attributes',
            Target: '@UI.FieldGroup#Attributes'
        }
    ],

    FieldGroup #General   : {Data: [
        {
            Value: name,
            Label: 'Name'
        },
        {
            Value: email,
            Label: 'Email (e.g. name@planet.galaxy)'
        },
        {
            Value: age,
            Label: 'Age (25-55)'
        },
        {
            Value: department_ID,
            Label: 'Department'
        },
        {
            Value: position_ID,
            Label: 'Position'
        }
    ]},

    FieldGroup #Journey   : {Data: [
        {
            Value: originPlanet_ID,
            Label: 'Origin Planet'
        },
        {
            Value: destinationPlanet_ID,
            Label: 'Destination Planet'
        }
    ]},

    FieldGroup #Attributes: {Data: [
        {
            Value: stardustCollection,
            Label: 'Stardust Collection (≥ 0)'
        },
        {
            Value: wormholeNavigationSkill,
            Label: 'Wormhole Navigation Skill (1–100)'
        },
        {
            Value: spacesuitColor,
            Label: 'Spacesuit Color (e.g. Cosmic Blue)'
        }
    ]}
});

annotate service.Spacefarers with @(Capabilities: {
    SortRestrictions  : {NonSortableProperties: [owner]},
    FilterRestrictions: {NonFilterableProperties: [owner]}
});

annotate service.Spacefarers with {
    originPlanet      @Common.Text                    : originPlanet.name
                      @Common.TextArrangement         : #TextOnly
                      @Common.Label                   : 'Origin Planet'
                      @Common.ValueListWithFixedValues: true
                      @Common.ValueList               : {
        Label         : 'Origin Planet',
        CollectionPath: 'Planets',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: originPlanet_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };

    destinationPlanet @Common.Text                    : destinationPlanet.name
                      @Common.TextArrangement         : #TextOnly
                      @Common.Label                   : 'Destination Planet'
                      @Common.ValueListWithFixedValues: true
                      @Common.ValueList               : {
        Label         : 'Destination Planet',
        CollectionPath: 'Planets',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: destinationPlanet_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };

    department        @Common.Text                    : department.name
                      @Common.TextArrangement         : #TextOnly
                      @Common.Label                   : 'Department'
                      @Common.ValueListWithFixedValues: true
                      @Common.ValueList               : {
        Label         : 'Department',
        CollectionPath: 'Departments',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: department_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'name'
            }
        ]
    };
};

annotate service.Spacefarers with {
    position @Common.Text                    : position.displayTitle
             @Common.TextArrangement         : #TextOnly
             @Common.Label                   : 'Position'
             @Common.ValueListWithFixedValues: true
             @Common.ValueList               : {
        Label         : 'Position',
        CollectionPath: 'Positions',
        Parameters    : [
            {
                $Type            : 'Common.ValueListParameterInOut',
                LocalDataProperty: position_ID,
                ValueListProperty: 'ID'
            },
            {
                $Type            : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty: 'displayTitle'
            },
            {
                $Type            : 'Common.ValueListParameterIn',
                LocalDataProperty: department_ID,
                ValueListProperty: 'department_ID'
            }
        ]
    };
};

annotate service.Positions with {
    displayTitle @title: 'Position (Department)';
};

annotate service.Planets with {
    ID @UI.Hidden;
};

annotate service.Departments with {
    ID @UI.Hidden;
};

annotate service.Positions with {
    ID @UI.Hidden;
};

annotate service.Spacefarers with {
    owner                   @readonly  @Core.Immutable;
    ID                      @readonly  @Core.Immutable;
    createdAt               @readonly;
    createdBy               @readonly;
    modifiedAt              @readonly;
    modifiedBy              @readonly;
    originPlanet            @UI.ReadOnly: restrictedFieldsReadOnly;
    age                     @UI.ReadOnly: restrictedFieldsReadOnly;
    department              @UI.ReadOnly: restrictedFieldsReadOnly;
    position                @UI.ReadOnly: restrictedFieldsReadOnly;
    wormholeNavigationSkill @UI.ReadOnly: restrictedFieldsReadOnly;
};

annotate service.Planets with {
    name @title: 'Planet Name';
};

annotate service.Departments with {
    name @title: 'Department Name';
};

annotate service.Positions with {
    title @title: 'Position Title';
    rank  @title: 'Rank';
};
