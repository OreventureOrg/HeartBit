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
    const userId = req.user._id;
    const interval = req.query.interval;

    console.log(`Fetching chart data for user: ${userId}, interval: ${interval}`); // Adicionado log

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const now = new Date();
        let startDate;

        switch (interval) {
            case '24_horas':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7_days':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1_month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'all':
                startDate = new Date(0); // Desde o início
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // Padrão 7 dias
        }

        // Filtrar tarefas completadas dentro do intervalo selecionado
        const filteredTasks = user.tasks.filter(task => {
            const taskDate = new Date(task.dateCompleted);
            return taskDate >= startDate;
        });

        // Agrupar ganhos por data
        const earningsByDate = {};
        filteredTasks.forEach(task => {
            const date = new Date(task.dateCompleted).toISOString().split('T')[0];
            if (!earningsByDate[date]) {
                earningsByDate[date] = 0;
            }
            earningsByDate[date] += task.earnings;
        });

        // Ordenar datas e ganhos correspondentes
        const dates = Object.keys(earningsByDate).sort();
        const earnings = dates.map(date => earningsByDate[date]);

        console.log({ dates, earnings }); // Adiciona esta linha para logar os dados

        res.json({ dates, earnings });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
