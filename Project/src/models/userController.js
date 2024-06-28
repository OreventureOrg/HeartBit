const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path as necessary

// Route to get chart data
router.get('/getChartData', async (req, res) => {
    const { interval, userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'ID do usuário é necessário' });
    }

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
            startDate = new Date(0);
            break;
        default:
            startDate = new Date(endDate.getTime() - (7 * 24 * 60 * 60 * 1000));
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const tasksInRange = user.tasks.filter(task => 
            task.dateCompleted >= startDate && task.dateCompleted <= endDate);

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
        console.error('Erro ao buscar dados do gráfico:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;
