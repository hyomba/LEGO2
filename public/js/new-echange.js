const form = document.getElementById('new-echange');
const inputsQuantite = form.querySelectorAll('input[type=number]');

function isFormulaireValid() {
    let erreur = false;
    if(form.elements['nom'].validity.valueMissing || 
        form.elements['nom'].validity.tooShort ||
        form.elements['nom'].validity.tooLong
    ) {
        erreur = true;
        form.elements['nom'].classList.add('erreur');
    }
    else {
        form.elements['nom'].classList.remove('erreur');
    }

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

    const nom = form.elements['nom'].value;

    return { nom, briques };
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Validation du formulaire
    if(!isFormulaireValid()) {
        return;
    }

    // Préparer les données
    const data = prepareDonnee();

    // Envoyer la requête au serveur
    const response = await fetch('/api/echange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // Redirection à la page d'accueil si tout a bien fonctionner
    if(response.ok) {
        location.href = '/';
    }
});