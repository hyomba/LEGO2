export const isIdValid = (id) =>
    typeof id === 'number' &&
    Number.isFinite(id)

export const isQuantityValid = (quantity) =>
    typeof quantity === 'number' &&
    quantity > 0;

//Validation du nom de la proposition et de l'échange
export const isNomEchangePropositionValid = (nom) => 
    typeof nom === 'string' &&
    nom.length >= 5 &&
    nom.length <= 20;

//Validation du courriel
export const validateCourriel = (courriel) => 
        typeof courriel === 'string' &&
        courriel &&
        courriel.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);
  
//Validation du mot de passe
export const validateMotDePasse = (motdepasse) => 
        typeof motdepasse === 'string' &&
        motdepasse && 
        motdepasse.length >= 7;

//Validation de la proposition et de l'échange
export const isPropositionEchangeValid = (briques) =>
    Array.isArray(briques) &&
    briques.every((brique) => 
    isIdValid(brique.id_brique) && 
    isQuantityValid(brique.quantite)
);
