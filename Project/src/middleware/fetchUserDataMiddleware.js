const User = require('../models/User');

const fetchUserDataMiddleware = async (req, res, next) => {
    try {
        // Verificação se o usuário está autenticado
        if (!req.user || !req.user._id) {
            return res.status(401).send('User not authenticated');
        }

        // Busca pelo usuário no banco de dados
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Definindo as datas de hoje
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        console.log('Start of day:', startOfDay);
        console.log('End of day:', endOfDay);

        // Inicializando os valores a serem calculados
        let earnedToday = 0;
        let earnedTotal = 0;
        let actionsDoneToday = 0;
        let actionsDoneTotal = 0;

        // Iterando sobre as tarefas do usuário para calcular os valores
        user.tasks.forEach(task => {
            const taskDate = new Date(task.dateCompleted);
            console.log('Task Date:', taskDate);
            console.log('Task Earnings:', task.earnings);

            if (task.earnings) {
                earnedTotal += task.earnings;
                actionsDoneTotal += 1;

                if (taskDate >= startOfDay && taskDate < endOfDay) {
                    earnedToday += task.earnings;
                    actionsDoneToday += 1;
                }
            }
        });

        // Debugging - Log dos valores calculados
        console.log('earnedToday:', earnedToday);
        console.log('earnedTotal:', earnedTotal);
        console.log('actionsDoneToday:', actionsDoneToday);
        console.log('actionsDoneTotal:', actionsDoneTotal);

        // Passando os dados calculados para o req
        req.userBalance = user.balance || 0;
        req.username = user.username || '';
        req.earnedToday = earnedToday;
        req.earnedTotal = earnedTotal;
        req.actionsDoneToday = actionsDoneToday;
        req.actionsDoneTotal = actionsDoneTotal;

        next();
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
};



module.exports = fetchUserDataMiddleware;
