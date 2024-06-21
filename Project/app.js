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
app.use('/', userRoutes);

// ============= HOME ============= //

app.get("/", (req, res) => {
    res.render("index.html", { Page: "Home"});
});

app.get("/how_about", (req, res) => {
    res.render("./how_about.html", { Page: "How About"});
});

app.get("/news", (req, res) => {
    res.render("./news/news-list.html", { Page: "News"});
});

app.get("/new/:id", (req, res) => {
    const id = req.params.id;
    res.render("./news/news-details.html", { Page: "New Details"});
});

app.get("/campaigns_list", (req, res) => {
    res.render("./campaigns_list.html", { Page: "Campaigns List"});
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
    res.render("./dashboard/dashboard.html", { Page: "Dashboard"});
});

app.get("/affiliate", authMiddleware, (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const affiliateLink = `${host}/register?ref=${req.session.userId}`;
    res.render("./dashboard/affiliate.html", { Page: "Affiliate", affiliateLink });
});

app.get("/earn", authMiddleware, (req, res) => {
    res.render("./earn/earn.html", { Page: "Earn Template"});
});

app.get("/announcement", authMiddleware, (req, res) => {
    res.render("./earn/announcement.html", { Page: "Announcement"});
});

app.get("/platform", authMiddleware, (req, res) => {
    res.render("./earn/platform.html", { Page: "Platform"});
});

// ============= INIT SERVER ============= //

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});