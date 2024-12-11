// Chargement du fichier de configuration
import 'dotenv/config'

// Importations
import https from'node:https';
import { readFile } from 'node:fs/promises';
/*import redirectToHTTPS from './redirect-to-https.js';*/
import express, { json } from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import { engine } from 'express-handlebars'
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import { addToEchange, createEchange, deleteEchangeById, getEchangeById, getEchanges, getEchangesByUtilisateur } from './model/echange.js'
import { getBriques } from './model/briques.js'
import { isPropositionEchangeValid, isIdValid,validateCourriel,validateMotDePasse, isNomEchangePropositionValid} from './validation.js'
import './authentification.js'
import { addUtilisateur, getUtilisateurById } from './model/utilisateur.js'
import { addToProposition, creerProposition, getPropositionById, getPropositions } from './model/proposition.js';

// Création du serveur web
const app = express();

// Initialisation de la base de données de session
const MemoryStore = memorystore(session);

// Ajout de l'engin de rendu
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// Ajout de middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(session({
    cookie: { maxAge: 7200000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 7200000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
/*app.use(redirectToHTTPS);*/
app.use(express.static('public'));

// Programmation des routes
app.get('/', async (request, response) => {
    response.render('echanges', {
        titre: 'Liste des échanges | Brique Échange',
        styles: ['/css/echanges.css'],
        echanges: await getEchanges(),
        user: request.user
    });
});

//Route de la page profil
app.get('/utilisateur', async (request, response) => {
   const idUtilisateur = request.user?.id_utilisateur;
    const utilisateur = await getUtilisateurById(idUtilisateur);
    response.render('utilisateur', {
        titre: 'Profil | Brique Échange',
        styles: ['/css/echanges.css'],
        scripts: ['/js/utilisateur.js'],
        //nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        echanges: await getEchangesByUtilisateur(idUtilisateur),
        user: request.user
    });
});

//Créer un échange 
app.get('/echange', async (request, response) => {
    response.render('new-echange', {
        titre: 'Créer un échange | Brique Échange',
        styles: ['/css/new-echange.css'],
        scripts: ['/js/new-echange.js'],
        briques: await getBriques(),
        user: request.user
    });
});

app.get('/inscription', (request, response) => {
    if(request.user) {
        response.redirect('/');
        return;
    }
    response.render('creationCompte', {
        titre: 'Créer un Compte | Brique Échange ',
        styles: ['/css/inscription.css'],
        scripts: ['/js/inscription.js']
       
    });
});

app.get('/connexion', (request, response) => {
    if(request.user) {
        response.redirect('/');
        return;
    }
    response.render('connexion', {
        titre: 'connexion | Brique Échange',
        styles: ['/css/inscription.css'],
        scripts: ['/js/connexion.js']
       
    });
});

// Route pour voir toutes les propositions
app.get('/propositions', async (request, response) => {
    response.render('echanges', {
        titre: 'Liste des propositions | Brique Échange',
        styles: ['/css/propositions.css'],
        echanges: await getPropositions(),
        user: request.user
    });
});

// Route pour créer une proposition
app.get('/proposition', async (request, response) => {
    response.render('new-proposition', {
        titre: 'Créer une proposition | Brique Échange',
        styles: ['/css/new-proposition.css'],
        scripts: ['/js/new-proposition.js'],
        briques: await getBriques(),
        user: request.user
    });
});

//Route pour voir les détails d'un échange spécifique
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

//Route pour voir les détails d'une proposition spécifique
app.get('/proposition/:id', async (request, response) => {
    const propositionId = parseInt(request.params.id)
    if(!isIdValid(propositionId)) {
        return response.status(400).end();
    }

    const proposition  = await getPropositionById(propositionId);
    if(!proposition) {
        return response.status(404).end();
    }

    response.render('proposition', {
        titre: 'Proposition | Brique Échange',
        styles: ['/css/proposition.css'],
        proposition: proposition
    });
});


//Créer un échange
app.post('/api/echange', async (request, response) => {
    if(isNomEchangePropositionValid(request.body.nom) && isPropositionEchangeValid(request.body.briques)) {
       console.log(request.user["id_utilisateur"]);

        const idEchange = await createEchange(request.user["id_utilisateur"], request.body.nom);
        Promise.all(request.body.briques.map(({ id_brique, quantite }) => 
            addToEchange(idEchange, id_brique, quantite)
        ));
        response.status(201).end();
    }
    else {
        response.status(400).end();
    }
});

//Créer une proposition et l'ajouter à la liste des propositions
app.post('/api/proposition', async (request, response) => {
    if(isNomEchangePropositionValid(request.body.nom) && isPropositionEchangeValid(request.body.briques)) {
       console.log(request.user["id_utilisateur"]);

        const idProposition = await creerProposition(request.user["id_utilisateur"], request.body.nom);
        Promise.all(request.body.briques.map(({ id_brique, quantite }) => 
            addToProposition(idProposition, id_brique, quantite)
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

//Route pour l'incription
app.post('/api/compte', async (request, response, next) => {
    if(request.user) {
        response.status(400).end();
        return;
    }

    if(validateCourriel(request.body.courriel) && 
       validateMotDePasse(request.body.motdepasse)) {
        try {
            console.log(request.body);
            await addUtilisateur(request.body.courriel,request.body.nom, request.body.prenom,request.body.motdepasse);
            response.status(201).end();
        }
        catch(erreur) {
            if(erreur.code === 'SQLITE_CONSTRAINT') {
                response.status(409).end();
            }
            else {
                next(erreur);
            }
        }
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/connexion', (request, response, next) => {
    if(request.user) {
        response.status(400).end();
        return;
    }

    if(validateCourriel(request.body.courriel) && 
       validateMotDePasse(request.body.motdepasse)) {
        passport.authenticate('local', (erreur, utilisateur, info) => {
            if(erreur) {
                next(erreur);
            }
            else if(!utilisateur) {
                response.status(401).json(info);
            }
            else {
                request.logIn(utilisateur, (erreur) => {
                    if(erreur) {
                        next(erreur);
                    }

                    response.status(200).end();
                });
            }
        })(request, response, next);
    }
    else {
        response.status(400).end();
    }
});

app.post('/api/deconnexion', (request, response, next) => {
    if(!request.user) {
        response.status(401).end();
        return;
    }

    request.logOut((erreur) => {
        if(erreur) {
            next(erreur);
        }

        response.redirect('/connexion');
    })
});

// Démarrage du serveur

if(process.env.NODE_ENV==='production'){
app.listen(process.env.PORT);
console.log('Serveur démarré');
console.log('http://localhost:' + process.env.PORT);
}
else{
    const config={
        cert: await readFile('./security/localhost.cert'),
        key:await readFile('./security/localhost.key')
    };
    console.log('Serveur démarré');
    console.log('https://localhost:' + process.env.PORT);
    https.createServer(config,app,).listen(process.env.PORT);

}