# Galactic Spacefarers

A SAP CAP application for managing galactic spacefarers, built with SAP CAP, SQLite, OData V4, and SAP Fiori elements.

The application provides a Fiori List Report and Object Page for managing spacefarers, together with validation, authentication/authorization, draft handling, and cosmic service event handlers with extensive testing.

## How to use

Clone the repository:

`git clone https://github.com/m-ahlstrom/galactic-spacefarers.git`

Enter the project directory:

`cd galactic-spacefarers`

Install the dependencies:

`npm install`

Run the application:

`cds watch`

The CAP service is available at:

`http://localhost:4004`

To be able to access and edit every data, use `alice:alice` at sign in (admin called MissionControl). To check how simple users work, use `bob:bob` or `zork:zork`. A user can only see spacefarers from their origin planet and can only edit entries that was created by them. Users can't edit origin planet, age, department, position and wormhole navigation skill. An example `.csv` dataset is provided.

To run the tests, use `npm test`.
