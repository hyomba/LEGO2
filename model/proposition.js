import { connexion } from '../db/db.js'

//Créer une proposition
export async function creerProposition(id_utilisateur, id_echange) {
    const result = await connexion.run(
        `INSERT INTO proposition(id_utilisateur, id_echange) 
            VALUES(?, ?)`, 
        [id_utilisateur, id_echange ]
    );

    return result.lastID;
}
//Ajouter une proposition à la liste des propositions
export async function addToProposition(idProposition, idBrique, quantite) {
    await connexion.run(
        `INSERT INTO proposition_brique(id_proposition, id_brique, quantite) 
        VALUES(?, ?, ?)`, 
        [idProposition, idBrique, quantite]
    );
}

//Voir une proposition spécifique
export async function getPropositionById(idProposition) {
    let [proposition, briques] = await Promise.all([
        // Requête pour récupérer les informations de la proposition et de l'échange
        connexion.get(
            `SELECT p.id_proposition, e.id_echange, e.nom_echange, u.nom, u.prenom, 
                    printf('%.2f', SUM(b.valeur * pb.quantite)) as valeur_totale
            FROM proposition p
            INNER JOIN utilisateur u ON p.id_utilisateur = u.id_utilisateur
            INNER JOIN proposition e ON e.id_echange = p.id_echange
            INNER JOIN proposition_brique pb ON p.id_proposition = pb.id_proposition
            INNER JOIN brique b ON pb.id_brique = b.id_brique
            
            WHERE p.id_proposition = ?
            GROUP BY e.id_echange, p.id_proposition, e.nom_echange, u.nom, u.prenom`, 
            [idProposition]
        ),

        // Requête pour récupérer les briques associées à la proposition
        connexion.all(
            `SELECT b.nom, b.image, printf('%.2f', b.valeur) AS valeur, c.nom as couleur, pb.quantite
            FROM proposition_brique pb
            INNER JOIN brique b ON pb.id_brique = b.id_brique
            INNER JOIN couleur c ON b.id_couleur = c.id_couleur
            WHERE pb.id_proposition = ?`, 
            [idProposition]
        )
    ]);

    // Si la proposition existe, ajouter les briques à l'objet de proposition
    if(proposition) {
        proposition.briques = briques;
    }

    return proposition;
}


// Voir toutes les propositions
export async function getPropositions(idEchange) {
    const propositions = await connexion.all(
        `SELECT 
        p.id_proposition,  
        e.nom_echange, 
        p.id_utilisateur, 
        u.nom, 
        u.prenom
        FROM proposition p
        INNER JOIN utilisateur u ON p.id_utilisateur = u.id_utilisateur
        INNER JOIN echange e ON p.id_echange = p.id_echange
        WHERE p.id_echange = ?`,

        [idEchange]
    );

    return propositions;
}