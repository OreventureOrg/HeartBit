const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 5000;

app.use(express.json());

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

app.get("/", (req, res) => {
    res.render("index.html", { Page: "Home"});
});

app.get("/news", (req, res) => {
    res.render("./news/news-list.html", { Page: "News"});
});

app.get("/new/:id", (req, res) => {
    const id = req.params.id
    console.log(id)
    res.render("./news/news-details.html", { Page: "New Details"});
});

app.get("/dashboard", (req, res) => {
    res.render("./dashboard/dashboard.html", { Page: "Dashboard"});
});

app.get("/affiliate", (req, res) => {
    res.render("./affiliate/affiliate.html", { Page: "Affiliate"});
});

const userRoutes = require('./src/routes/userRoutes');
app.use('/', userRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
