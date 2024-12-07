import { connexion } from '../db/db.js'

export async function getUtilisateurById(idUtilisateur) {
    const utilisateur = await connexion.get(
        `SELECT * FROM utilisateur WHERE id_utilisateur = ?;`,
        [idUtilisateur]
    );

    return utilisateur;
}