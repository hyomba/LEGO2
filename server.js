// Chargement du fichier de configuration
import 'dotenv/config'

// Importations
import express, { json } from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import { engine } from 'express-handlebars'
import { addToEchange, createEchange, deleteEchangeById, getEchangeById, getEchanges, getEchangesByUtilisateur } from './model/echange.js'
import { getBriques } from './model/briques.js'
import { isEchangeValid, isIdValid, isNomEchangeValid } from './validation.js'
import { getUtilisateurById } from './model/utilisateur.js'

// Création du serveur web
const app = express();

// Ajout de l'engin de rendu
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajout de middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(json());
app.use(express.static('public'));

// Programmation des routes
app.get('/', async (request, response) => {
    response.render('echanges', {
        titre: 'Liste des échanges | Brique Échange',
        styles: ['/css/echanges.css'],
        echanges: await getEchanges()
    });
});

app.get('/utilisateur', async (request, response) => {
    const utilisateur = await getUtilisateurById(1)
    response.render('utilisateur', {
        titre: 'Profil | Brique Échange',
        styles: ['/css/echanges.css'],
        scripts: ['/js/utilisateur.js'],
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        echanges: await getEchangesByUtilisateur(1)
    });
});

app.get('/echange', async (request, response) => {
    response.render('new-echange', {
        titre: 'Créer un échange | Brique Échange',
        styles: ['/css/new-echange.css'],
        scripts: ['/js/new-echange.js'],
        briques: await getBriques()
    });
});

app.get('/echange/:id', async (request, response) => {
    const echangeId = parseInt(request.params.id)
    if(!isIdValid(echangeId)) {
        return response.status(400).end();
    }

    const echange = await getEchangeById(echangeId);
    if(!echange) {
        return response.status(404).end();
    }

    response.render('echange', {
        titre: 'Échange | Brique Échange',
        styles: ['/css/echange.css'],
        echange: echange
    });
});

app.post('/api/echange', async (request, response) => {
    if(isNomEchangeValid(request.body.nom) && isEchangeValid(request.body.briques)) {
        const idEchange = await createEchange(1, request.body.nom);
        Promise.all(request.body.briques.map(({ id_brique, quantite }) => 
            addToEchange(idEchange, id_brique, quantite)
        ));
        response.status(201).end();
    }
    else {
        response.status(400).end();
    }
});

app.delete('/api/echange', async (request, response) => {
    if(isIdValid(request.body.echangeId)) {
        deleteEchangeById(request.body.echangeId);
        response.status(200).end();
    }
    else {
        response.status(400).end();
    }
});

// Démarrage du serveur
app.listen(process.env.PORT);
console.log('Serveur démarré');
console.log('http://localhost:' + process.env.PORT);
