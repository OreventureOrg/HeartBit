const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ajuste o caminho conforme necessário

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).send('User not authenticated');
    }
    next();
};

// Aplicando o middleware de autenticação para todas as rotas abaixo
router.use(authMiddleware);

// Rota para obter dados do gráfico
router.get('/getChartData', async (req, res) => {
    const { interval, userId } = req.query;

    // Fetch chart data based on the interval and userId
    try {
        const data = await ChartData.getData(interval, userId); // Define getData method in your ChartData model
        res.json(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
