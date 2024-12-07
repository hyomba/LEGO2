const form = document.getElementById('new-compte');
const inputCourriel = document.getElementById('input-courriel');
const inputMotDePasse = document.getElementById('input-motdepasse');
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
    const password = form.elements[' motdepasse'].value;

    if(password.length < 8) {
        erreur = true;
        form.elements['input-motdepasse'].classList.add('erreur');
    } else {
        form.elements['input-motdepasse'].classList.remove('erreur');
    }

    return !erreur;
}*/

async function connexion(event) {
    event.preventDefault();

    const data = {
        courriel: inputCourriel.value,
        motdepasse: inputMotDePasse.value
    }

    const response = await fetch('/api/connexion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if(response.ok) {
        location.replace('/');
    }
    else if(response.status === 401) {
        const message = await response.json();
        if(message.erreur === 'mauvais_courriel') {
            erreurAuth.innerText = 'Un compte avec ce courriel n\'existe pas.';
        }
        else if(message.erreur === 'mauvais_motdepasse') {
            erreurAuth.innerText = 'Le mot de passe pour ce compte n\'est pas valide.';
        }
    }
}

form.addEventListener('submit', connexion)


