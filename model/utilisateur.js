import { connexion } from '../db/db.js'
import { hash } from 'bcrypt';

export async function getUtilisateurById(idUtilisateur) {
    const utilisateur = await connexion.get(
        `SELECT * FROM utilisateur WHERE id_utilisateur = ?;`,
        [idUtilisateur]
    );

    return utilisateur;
}
export async function getUtilisateurByCourriel(courriel) {
    const utilisateur = await connexion.get(
        'SELECT * FROM utilisateur WHERE courriel = ?',
        [courriel]
    );

    return utilisateur;
}

export async function addUtilisateur(courriel,nom,prenom,motdepasse) {
    const motdepasseHash = await hash(motdepasse, 10);
        const result = await connexion.run(
            `INSERT INTO utilisateur( courriel, nom, prenom, mot_de_passe)
            VALUES(?, ?, ?, ?)`, 
            [courriel, nom, prenom, motdepasseHash]
        );
    
        return result.lastID;
}