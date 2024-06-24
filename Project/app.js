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

// ============= BODY-PARSER SETUP ============= //

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ============= MONGO SETUP ============= //

mongoose.connect(process.env.MONGO_URI, {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com MongoDB:'));
db.once('open', () => {
    console.log('Conectado ao MongoDB');
});

// ============= GENERAL SETUP ============= //

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

const userRoutes = require('./src/routes/userRoutes');
const withdrawRoutes = require('./src/routes/withdrawRoutes');
const depositRoutes = require('./src/routes/depositRoutes');
app.use('/', userRoutes);
app.use('/api/withdraw', withdrawRoutes);

const announcementRoutes = require('./src/routes/announcement');
app.use('/', announcementRoutes);

// ============= HOME ============= //

app.get("/", (req, res) => {
    res.render("index.html", { Page: "Home"});
});

app.get("/how_about", (req, res) => {
    res.render("./how_about.html", { Page: "How About"});
});

// ============= AUTH ============= //

app.get("/login", (req, res) => {
    res.render("./auth/login.html", { Page: "Login"});
});

app.get("/register", (req, res) => {
    const referenceCode = req.query.ref || '';
    res.render("auth/register.html", { Page: "Register", referenceCode });
});


// ============= DASHBOARD ============= //

app.get("/dashboard", authMiddleware, (req, res) => {
    res.render("./dashboard/dashboard.html", { Page: "Dashboard", userBalance: req.userBalance });
});

app.get("/affiliate", authMiddleware, (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const affiliateLink = `${host}/register?ref=${req.session.userId}`;
    res.render("./dashboard/affiliate.html", { Page: "Affiliate", affiliateLink, userBalance: req.userBalance  });
});

app.get("/announcement", authMiddleware, (req, res) => {
    const platform = req.query.platform || 'Platform';
    const action = req.query.action || 'Action';
    const successMessage = req.query.success === 'true' ? 'Campaign created successfully!' : '';
    res.render("./earn/announcement.html", { Page: "Announcement", platform, action, successMessage, userBalance: req.userBalance });
});
app.get("/platform", authMiddleware, (req, res) => {
    res.render("./earn/platform.html", { Page: "Platform", userBalance: req.userBalance });
});

app.get("/services", authMiddleware, (req, res) => {
    res.render("./services.html", { Page: "Services"});
});

app.get("/withdraw", authMiddleware, (req, res) => {
    res.render("./dashboard/withdraw.html", { Page: "Withdraw", userBalance: req.userBalance  });
});

// ============= INIT SERVER ============= //

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});