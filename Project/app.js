const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const app = express();
const PORT = 5000;

const authMiddleware = require('./src/middleware/authMiddleware');
const addUserMiddleware = require('./src/middleware/addUserMiddleware');
const fetchUserDataMiddleware = require('./src/middleware/fetchUserDataMiddleware');
const User = require('./src/models/User'); // Certifique-se de que o modelo User está sendo importado
const apiRoutes = require('./src/routes/api'); // ajuste o caminho conforme necessário


// ============= BODY-PARSER SETUP ============= //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/apie', apiRoutes);

// ============= MONGO SETUP ============= //

mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com MongoDB:'));
db.once('open', () => {
    console.log('Conectado ao MongoDB');
});

// ============= SESSION SETUP ============= //

app.use(session({
    secret: 'secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// ============= ROUTES ============= //

app.post('/hide-announcement', (req, res) => {
    const { announcementId } = req.body;

    if (!req.session.hiddenAnnouncements) {
        req.session.hiddenAnnouncements = [];
    }

    if (!req.session.hiddenAnnouncements.includes(announcementId)) {
        req.session.hiddenAnnouncements.push(announcementId);
    }

    res.sendStatus(200);
});

const userRoutes = require('./src/routes/userRoutes');
const withdrawRoutes = require('./src/routes/withdrawRoutes');
const depositRoutes = require('./src/routes/depositRoutes');
const announcementRoutes = require('./src/routes/announcement');

app.use('/', userRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/deposit', depositRoutes);
app.use('/', announcementRoutes);

// ============= VIEW ENGINE SETUP ============= //

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// ============= HOME ============= //

app.get("/", addUserMiddleware, (req, res) => {
    res.render("index.html", { Page: "Home", user: req.user });
});

app.get("/how_about", addUserMiddleware, (req, res) => {
    res.render("./how_about.html", { Page: "How About", user: req.user });
});

// ============= AUTH ============= //

app.get("/login", (req, res) => {
    res.render("./auth/login.html", { Page: "Login" });
});

app.get("/register", (req, res) => {
    const referenceCode = req.query.ref || '';
    res.render("auth/register.html", { Page: "Register", referenceCode });
});

// ============= DASHBOARD ============= //

app.get("/dashboard", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    try {
        console.log('Rendering dashboard with user data:', {
            userBalance: req.userBalance,
            username: req.username,
            actionsDoneToday: req.actionsDoneToday,
            actionsDoneTotal: req.actionsDoneTotal,
            earnedToday: req.earnedToday,
            earnedTotal: req.earnedTotal
        });

        res.render("./dashboard/dashboard.html", {
            Page: "Dashboard",
            userBalance: req.userBalance,
            username: req.username,
            actionsDoneToday: req.actionsDoneToday,
            actionsDoneTotal: req.actionsDoneTotal,
            earnedToday: req.earnedToday,
            earnedTotal: req.earnedTotal
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/affiliate", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const affiliateLink = `${host}/register?ref=${req.session.userId}`;
    res.render("./dashboard/affiliate.html", { Page: "Affiliate", affiliateLink, userBalance: req.userBalance, username: req.username });
});

app.get("/announcement", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    const platform = req.query.platform || 'Platform';
    const action = req.query.action || 'Action';
    const successMessage = req.query.success === 'true' ? 'Campaign created successfully!' : '';
    res.render("./earn/announcement.html", { Page: "Announcement", platform, action, successMessage, userBalance: req.userBalance, username: req.username });
});

app.get("/platform", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    res.render("./earn/platform.html", { Page: "Platform", userBalance: req.userBalance, username: req.username });
});

app.get("/services", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    res.render("./services.html", { Page: "Services", user: req.user });
});

app.get("/withdraw", authMiddleware, fetchUserDataMiddleware, (req, res) => {
    res.render("./dashboard/withdraw.html", { Page: "Withdraw", userBalance: req.userBalance, username: req.username });
});

// ============= INIT SERVER ============= //

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
