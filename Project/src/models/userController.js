const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.get('/getChartData', async (req, res) => {
    const { interval, userId } = req.query;

    // Calcular a data inicial baseada no intervalo selecionado
    const endDate = new Date();
    let startDate;
    switch (interval) {
        case '24_horas':
            startDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000));
            break;
        case '7_days':
            startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
            break;
        case '1_month':
            startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
            break;
        case 'all':
            startDate = new Date(0); // Desde o início dos tempos
            break;
        default:
            startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    try {
        // Encontrar o usuário pelo ID e filtrar tarefas baseadas na data
        const user = await User.findById(userId);
        const tasksInRange = user.tasks.filter(task => task.dateCompleted >= startDate && task.dateCompleted <= endDate);

        // Organizar os dados para o gráfico
        const dates = [];
        const earnings = [];
        const actions = [];

        tasksInRange.forEach(task => {
            const date = task.dateCompleted.toISOString().split('T')[0];
            if (!dates.includes(date)) {
                dates.push(date);
                earnings.push(0);
                actions.push(0);
            }
            const index = dates.indexOf(date);
            earnings[index] += task.earnings;
            actions[index] += 1;
        });

        res.json({ dates, earnings, actions });
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
