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
import { isEchangeValid, isIdValid, isNomEchangeValid,validateCourriel,validateMotDePasse } from './validation.js'
import './authentification.js'
import { addUtilisateur,getUtilisateurById } from './model/utilisateur.js'

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
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
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

app.get('/utilisateur', async (request, response) => {
    const idUtilisateur = request.user?.id_utilisateur;
    const utilisateur = await getUtilisateurById(idUtilisateur);
    response.render('utilisateur', {
        titre: 'Profil | Brique Échange',
        styles: ['/css/echanges.css'],
        scripts: ['/js/utilisateur.js'],
        nom:utilisateur.nom,
        prenom:utilisateur.prenom,
        echanges: await getEchangesByUtilisateur(idUtilisateur),
        user: request.user
    });
});

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

// Route de la CREATION D'UNE PROPOSITION pour un échange
app.get('/proposition/:idEchange', async (request, response) => {
    const idEchange = parseInt(request.params.idEchange);
    const utilisateur = request.session.utilisateur; // En supposant que nous utilisons des sessions pour identifier l’utilisateur connecté

    // Vérifier que l'utilisateur est connecté
    if (!utilisateur) {
        return response.status(401).redirect('/login'); // Rediriger vers la page de login si l'utilisateur n'est pas connecté
    }

    // Valider l'ID de l'échange
    if (!isIdValid(idEchange)) {
        return response.status(400).end(); // Retourner 400 si l'ID est invalide
    }

    // Obtenir les informations de l'échange
    const echange = await getEchangeById(idEchange);
    if (!echange) {
        return response.status(404).send('Échange non trouvé.'); // Retourner 404 si l'échange n'existe pas
    }

    // Vérifier que l'utilisateur n'est pas le propriétaire de l'échange
    if (echange.id_utilisateur === utilisateur.id_utilisateur) {
        return response.status(403).send('Vous ne pouvez pas créer une proposition pour votre propre échange.');
    }

    // Obtenir les briques disponibles
    const briques = await getBriques();

    // Rendre la vue pour créer une proposition
    response.render('new-proposition', {
        titre: 'Créer une proposition | Brique Échange',
        styles: ['/css/new-proposition.css'],
        scripts: ['/js/new-proposition.js'],
        briques,
        idEchange
    });
});

// Route por la VISUALISATION D'UNE PROPOSITION pour un échange
app.get('/proposition/visualiser/:idProposition', async (request, response) => {
    const idProposition = parseInt(request.params.idProposition);
    const utilisateur = request.session.utilisateur;

    // Vérifier que l'utilisateur est connecté
    if (!utilisateur) {
        return response.status(401).redirect('/login');
    }

    // Valider l'ID de la proposition
    if (!isIdValid(idProposition)) {
        return response.status(400).send('ID de proposition invalide.');
    }

    // Obtenir les informations de la proposition
    const proposition = await getPropositionById(idProposition);
    if (!proposition) {
        return response.status(404).send('Proposition non trouvée.');
    }

    // Obtenir les informations de l'échange pour lequel la proposition a été faite
    const echange = await getEchangeById(proposition.id_echange);
    if (!echange) {
        return response.status(404).send('Échange non trouvé.');
    }

    // Vérifier que l'utilisateur est propriétaire de l'échange
    if (echange.id_utilisateur !== utilisateur.id_utilisateur) {
        return response.status(403).send('Vous ne pouvez pas visualiser une proposition pour un échange qui ne vous appartient pas.');
    }

    // Obtenir l'utilisateur qui a créé la proposition
    const createurProposition = await getUtilisateurById(proposition.id_utilisateur);
    
    // Calculer la valeur totale de la proposition
    const briques = await getBriquesDeProposition(idProposition);
    let valeurTotale = 0;
    briques.forEach((brique) => {
        valeurTotale += brique.quantite * brique.valeur;
    });

    // Rendre la vue pour visualiser la proposition
    response.render('visualiser-proposition', {
        titre: 'Visualiser une proposition | Brique Échange',
        styles: ['/css/new-proposition.css'],
        echangeNom: echange.nom_echange,
        createurNom: `${createurProposition.prenom} ${createurProposition.nom}`,
        valeurTotale,
        briques
    });
});

app.post('/api/echange', async (request, response) => {
    if(isNomEchangeValid(request.body.nom) && isEchangeValid(request.body.briques)) {
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

app.delete('/api/echange', async (request, response) => {
    if(isIdValid(request.body.echangeId)) {
        deleteEchangeById(request.body.echangeId);
        response.status(200).end();
    }
    else {
        response.status(400).end();
    }
});

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