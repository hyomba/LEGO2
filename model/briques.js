import { connexion } from '../db/db.js'

export async function getBriques() {
    const briques = await connexion.all(
        `SELECT b.*, c.nom AS couleur
        FROM brique b
        INNER JOIN couleur c ON b.id_couleur = c.id_couleur`
    );

    return briques;
}