const form = document.getElementById('new-proposition');
const inputsQuantite = form.querySelectorAll('input[type=number]');

function isFormulaireValid() {
    let erreur = false;

    // Vérifier que l'utilisateur est connecté et que le formulaire est valide
    if (!userIsConnected()) {
        erreur = true;
        alert('Vous devez être connecté pour faire une proposition.');
        return false;
    }

    // Vérifier que les briques ont une quantité valide
    if (Array.from(inputsQuantite).every((input) => input.value === '0')) {
        erreur = true;
        inputsQuantite.forEach((input) => input.classList.add('erreur'));
    } else {
        inputsQuantite.forEach((input) => input.classList.remove('erreur'));
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

    // Redirection à la page d'accueil si tout a bien fonctionné
    if (response.ok) {
        location.href = '/';
    } else {
        alert('Erreur lors de la création de la proposition.');
    }
});

// Fonction fictive pour vérifier si l'utilisateur est connecté
function userIsConnected() {
    // Remplacer avec une vraie vérification de l'utilisateur
    return true;  // Ceci est seulement pour l'exemple
}
