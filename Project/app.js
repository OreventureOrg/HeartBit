const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/heartbit', {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erro de conexão com MongoDB:'));
db.once('open', () => {
    console.log('Conectado ao MongoDB');
});

app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secreta',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/heartbit' })
}));

const userRoutes = require('./src/routes/userRoutes');
app.use('/', userRoutes);

app.get("/", (req, res) => {
    res.render("index.html", { Page: "Home"});
});

app.get("/news", (req, res) => {
    res.render("./news/news-list.html", { Page: "News"});
});

app.get("/new/:id", (req, res) => {
    const id = req.params.id;
    console.log(id);
    res.render("./news/news-details.html", { Page: "New Details"});
});

app.get("/dashboard", (req, res) => {
    res.render("./dashboard/dashboard.html", { Page: "Dashboard"});
});

app.get("/affiliate", (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const affiliateLink = `http://yourwebsite.com/register?ref=${req.session.userId}`;
    res.render("./dashboard/affiliate.html", { Page: "Affiliate", affiliateLink });
});


app.get("/login", (req, res) => {
    res.render("./auth/login.html", { Page: "Login"});
});

app.get("/register", (req, res) => {
    res.render("./auth/register.html", { Page: "Register"});
});
app.get("/how_about", (req, res) => {
    res.render("./how_about.html", { Page: "How About"});
});

app.get("/earn", (req, res) => {
    res.render("./earn/earntemplate.html", { Page: "Earn Template"});
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
