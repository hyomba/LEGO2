export const isIdValid = (id) =>
    typeof id === 'number' &&
    Number.isFinite(id)

export const isQuantityValid = (quantity) =>
    typeof quantity === 'number' &&
    quantity > 0;

export const isEchangeValid = (briques) => 
    Array.isArray(briques) &&
    briques.every((brique) => 
        isIdValid(brique.id_brique) && 
        isQuantityValid(brique.quantite)
    );

export const isNomEchangeValid = (nom) => 
    typeof nom === 'string' &&
    nom.length >= 10 &&
    nom.length <= 100;
