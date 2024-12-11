import { connexion } from '../db/db.js'

export async function createEchange(idUtilisateur, nom) {
    const result = await connexion.run(
        `INSERT INTO echange(id_utilisateur, nom_echange) VALUES(?, ?)
       `, 
        [idUtilisateur, nom]
    );

    return result.lastID;
}

export async function addToEchange(idEchange, idBrique, quantite) {
    await connexion.run(
        `INSERT INTO echange_brique(id_echange, id_brique, quantite) 
        VALUES(?, ?, ?)`, 
        [idEchange, idBrique, quantite]
    );
}

export async function getEchangeById(idEchange) {
    let [echange, briques] = await Promise.all([
        connexion.get(
            `SELECT e.id_echange, e.nom_echange, u.nom, u.prenom, printf('%.2f', SUM(b.valeur * eb.quantite)) as valeur_totale
            FROM echange e
            INNER JOIN echange_brique eb ON e.id_echange = eb.id_echange
            INNER JOIN brique b ON eb.id_brique = b.id_brique
            INNER JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
            WHERE e.id_echange = ?
            GROUP BY e.id_echange`, 
            [idEchange]
        ),
        connexion.all(
            `SELECT b.nom, b.image, printf('%.2f', b.valeur) AS valeur, c.nom as couleur, eb.quantite
            FROM echange_brique eb
            INNER JOIN brique b ON eb.id_brique = b.id_brique
            INNER JOIN couleur c ON b.id_couleur = c.id_couleur
            WHERE eb.id_echange = ?`, 
            [idEchange]
        )
    ]);

    if(echange) {
        echange.briques = briques;
    }
    
    return echange;
}

export async function getEchangesByUtilisateur(idUtilisateur) {
    const echanges = await connexion.all(
        `SELECT 
            e.id_echange, 
            e.nom_echange,
            u.id_utilisateur, 
            u.nom, 
            u.prenom,
            e.id_proposition_accepte IS NULL AS termine
        FROM echange e
        INNER JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
        WHERE u.id_utilisateur = ? AND e.id_proposition_accepte IS ?`, 
        [idUtilisateur]
    );

    return echanges;
}

export async function getEchanges() {
    const echanges = await connexion.all(
        `SELECT e.id_echange, e.nom_echange, u.id_utilisateur, u.nom, u.prenom
        FROM echange e
        INNER JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
        WHERE e.id_proposition_accepte IS NULL`
    );

    return echanges;
}

export async function deleteEchangeById(idEchange) {
    await connexion.run(
        'DELETE FROM echange WHERE id_echange = ?',
        [idEchange]
    );

    await connexion.run(
        'DELETE FROM echange_brique WHERE id_echange = ?',
        [idEchange]
    );
}
