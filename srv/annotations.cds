using GalacticService as service from './galactic-service';

annotate service.Spacefarers with @(
    UI: {
        HeaderInfo: {
            TypeName: 'Spacefarer',
            TypeNamePlural: 'Spacefarers',
            Title: { Value: name },
            Description: { Value: originPlanet }
        },

        // List Report table columns
        LineItem: [
            { Value: name, Label: 'Name' },
            { Value: originPlanet, Label: 'Origin Planet' },
            { Value: destinationPlanet, Label: 'Destination Planet' },
            { Value: stardustCollection, Label: 'Stardust Collection' },
            { Value: wormholeNavigationSkill, Label: 'Wormhole Nav. Skill' },
            { Value: spacesuitColor, Label: 'Spacesuit Color' },
            { Value: position, Label: 'Position' }
        ],

        // List Report filter bar
        SelectionFields: [
            originPlanet,
            destinationPlanet,
            spacesuitColor,
            department,
            position
        ],

        // Object Page layout
        Facets: [
            {
                $Type: 'UI.ReferenceFacet',
                Label: 'General Information',
                Target: '@UI.FieldGroup#General'
            },
            {
                $Type: 'UI.ReferenceFacet',
                Label: 'Cosmic Journey',
                Target: '@UI.FieldGroup#Journey'
            },
            {
                $Type: 'UI.ReferenceFacet',
                Label: 'Cosmic Attributes',
                Target: '@UI.FieldGroup#Attributes'
            }
        ],

        FieldGroup#General: {
            Data: [
                { Value: name, Label: 'Name' },
                { Value: email, Label: 'Email' },
                { Value: age, Label: 'Age' },
                { Value: department, Label: 'Department' },
                { Value: position, Label: 'Position' }
            ]
        },

        FieldGroup#Journey: {
            Data: [
                { Value: originPlanet, Label: 'Origin Planet' },
                { Value: destinationPlanet, Label: 'Destination Planet' }
            ]
        },

        FieldGroup#Attributes: {
            Data: [
                { Value: stardustCollection, Label: 'Stardust Collection' },
                { Value: wormholeNavigationSkill, Label: 'Wormhole Navigation Skill' },
                { Value: spacesuitColor, Label: 'Spacesuit Color' }
            ]
        }
    }
);

// Sort/filter capability hints
annotate service.Spacefarers with @(
    Capabilities: {
        SortRestrictions: {
            NonSortableProperties: [ owner ]
        },
        FilterRestrictions: {
            NonFilterableProperties: [ owner ]
        }
    }
);

// Field-level read-only / immutability
annotate service.Spacefarers with {
    owner     @readonly @Core.Immutable;
    ID        @readonly @Core.Immutable;
    createdAt @readonly;
    createdBy @readonly;
    modifiedAt @readonly;
    modifiedBy @readonly;
    originPlanet             @UI.ReadOnly: { $Path: 'restrictedFieldsReadOnly' };
    age                      @UI.ReadOnly: { $Path: 'restrictedFieldsReadOnly' };
    department                @UI.ReadOnly: { $Path: 'restrictedFieldsReadOnly' };
    position                  @UI.ReadOnly: { $Path: 'restrictedFieldsReadOnly' };
    wormholeNavigationSkill   @UI.ReadOnly: { $Path: 'restrictedFieldsReadOnly' };
};