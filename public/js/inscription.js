const form = document.getElementById('new-compte');
const inputCourriel = document.getElementById('input-courriel');
const inputMotDePasse = document.getElementById('input-motdepasse');
const inputNom = document.getElementById('input-nom');
const inputPrenom = document.getElementById('input-prenom');
const erreurAuth = document.getElementById('erreur-auth');

/*function isFormulaireValid() {
    let erreur = false;


    // Vérification de l'email
    if(form.elements['input-courriel'].validity.valueMissing || 
       form.elements['input-courriel'].validity.typeMismatch) {
        erreur = true;
        form.elements['input-courriel'].classList.add('erreur');
    } else {
        form.elements['input-courriel'].classList.remove('erreur');
    }

    // Vérification du mot de passe et confirmation
    const password = form.elements['motdepasse'].value;

    if(password.length < 8) {
        erreur = true;
        form.elements['input-motdepasse'].classList.add('erreur');
    } else {
        form.elements['input-motdepasse'].classList.remove('erreur');
    }

    return !erreur;
}*/

async function inscription(event) {
    event.preventDefault();

    const data = {
        courriel: inputCourriel.value,
        motdepasse: inputMotDePasse.value,
        prenom:inputPrenom.value,
        nom: inputNom.value
    }

    const response = await fetch('/api/compte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if(response.ok) {
        location.href = '/connexion';
    }
    else if(response.status === 409) {
        erreurAuth.innerText = 'Un compte avec ce courriel existe déjà.';
    }
}

form.addEventListener('submit', inscription)


