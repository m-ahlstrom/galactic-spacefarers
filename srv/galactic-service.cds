using { galactic.spacefarer as db } from '../db/schema';

service GalacticService {

    entity Spacefarers as projection on db.Spacefarers;
}