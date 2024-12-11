const form = document.getElementById('new-proposition');
const inputsQuantite = form.querySelectorAll('input[type=number]');
const divNom = document.getElementsByClassName('nom'); 
const erreurNom = document.getElementById('erreur-nom');

function isFormulaireValid() {
    if(divNom.validity.valid) {
        divNom.classList.remove('erreur');
        erreurNom.innerText = '';
    }
    else {
        divNom.classList.add('erreur');
        if(divNom.validity.valueMissing) {
            divNom.innerText = 'Le champs de texte doit être remplis.';
        }
        else if(divNom.validity.tooShort) {
            divNom.innerText = 'Le champs de texte doit contenir au moins 5 caractères.';
        }
        else if(divNom.validity.tooLong) {
            divNom.innerText = 'Le champs de texte doit contenir au maximum 20 caractères.';
        }
    }
    // Valiidité les champs de quantité
    if(Array.from(inputsQuantite).every((input) => input.value === '0')) {
        erreur = true;
        inputsQuantite.forEach((input) => input.classList.add('erreur'))
    }
    else {
        inputsQuantite.forEach((input) => input.classList.remove('erreur'))
    }

    return !erreur;
}

function prepareDonnee() {
    const briques = Array.from(inputsQuantite, (input) => ({
        id_brique: parseInt(input.dataset.id),
        quantite: parseInt(input.value)
    })).filter((brique) => parseInt(brique.quantite));

    console.log(briques);

    // Récupérer l'id de l'échange auquel on veut faire une proposition
    const idEchange = form.dataset.idEchange;

    return { idEchange, briques };
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validation du formulaire
    if (!isFormulaireValid()) {
        return;
    }

    // Préparer les données
    const data = prepareDonnee();

    // Envoyer la requête au serveur
    const response = await fetch('/api/proposition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Redirection à la page de toutes les prpositions si tout a bien fonctionné
    if (response.ok) {
        location.href = '/propositions';
    } 
});


