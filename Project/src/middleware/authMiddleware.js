// authMiddleware.js
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                req.userBalance = user.balance;
                req.username = user.username; // Adicionando o username à requisição
                next();
            } else {
                res.redirect('/login');
            }
        } catch (err) {
            console.error('Erro ao encontrar usuário:', err);
            res.redirect('/login');
        }
    } else {
        res.redirect('/login');
    }
};

module.exports = authMiddleware;
