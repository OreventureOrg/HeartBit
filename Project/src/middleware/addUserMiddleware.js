// src/middleware/addUserMiddleware.js
const User = require("../models/User");

const addUserMiddleware = async (req, res, next) => {
    if (req.session && req.session.userId) {
        try {
            const user = await User.findById(req.session.userId);
            if (user) {
                req.user = user;
                req.username = user.username; // Adicionando o username à requisição
                req.actionsDoneToday = user.actionsDoneToday;
                req.actionsDoneTotal = user.actionsDoneTotal;
                req.earnedToday = user.earnedToday;
                req.earnedTotal = user.earnedTotal;
            }
        } catch (err) {
            console.error('Erro ao encontrar usuário:', err);
        }
    }
    next();
};

module.exports = addUserMiddleware;
