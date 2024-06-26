const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');
const authMiddleware = require('../middleware/authMiddleware');
const fetchUserDataMiddleware = require('../middleware/fetchUserDataMiddleware');
const User = require('../models/User');

router.get('/earn/:platform/:action', authMiddleware, async (req, res) => {
    const { platform, action } = req.params;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        let announcements = await Announcement.find({
            platform,
            action,
            paused: false, // Ensure only active announcements are fetched
            _id: { $nin: user.tasks.map(task => task.taskId) }
        });

        if (req.session.hiddenAnnouncements) {
            announcements = announcements.filter(announcement => 
                !req.session.hiddenAnnouncements.includes(announcement._id.toString())
            );
        }

        res.render('./earn/earn.html', {
            Page: 'Earn',
            platform,
            action,
            announcements,
            userBalance: req.userBalance,
            username: req.username
        });
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        res.status(500).send('Erro ao buscar anúncios');
    }
});

router.post('/announcement', authMiddleware, async (req, res) => {
    try {
        const {
            platform,
            action,
            profileUrl,
            username,
            description,
            thumbnailUrl,
            rewardPerAction,
            dailyLimit,
            overallLimit
        } = req.body;

        const newAnnouncement = new Announcement({
            platform,
            action,
            youtubeUrl: platform === 'youtube' ? profileUrl : undefined,
            username,
            description,
            thumbnailUrl: platform === 'youtube' ? thumbnailUrl : undefined,
            rewardPerAction: parseFloat(rewardPerAction) / 2,
            dailyLimit: parseInt(dailyLimit) || 0,
            overallLimit: parseInt(overallLimit) || 0,
            postedBy: req.user._id,
            paused: false // Ensure new announcements are not paused by default
        });

        await newAnnouncement.save();
        res.redirect(`/announcement?success=true&platform=${platform}&action=${action}`);
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.get("/complete-task/:announcementId", authMiddleware, async (req, res) => {
    const { announcementId } = req.params;
    const userId = req.user._id;

    try {
        const announcementObj = await Announcement.findById(announcementId);

        if (!announcementObj) {
            return res.status(404).send('Announcement not found');
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        const taskCompleted = user.tasks.some(task => task.taskId.equals(announcementId));

        if (taskCompleted) {
            return res.status(400).send('Task already completed');
        }

        if (isNaN(announcementObj.rewardPerAction)) {
            return res.status(400).send('Invalid reward value');
        }

        const reward = announcementObj.rewardPerAction;
        const penalty = reward * 2;

        user.tasks.push({ taskId: announcementId, dateCompleted: new Date(), earnings: reward });
        user.balance += reward;

        announcementObj.totalActions += 1;
        announcementObj.totalSpent += reward;
        await announcementObj.save();

        const poster = await User.findById(announcementObj.postedBy);
        if (poster) {
            poster.balance -= penalty;
            await poster.save();
        }

        // Verificação do referenceCode
        if (user.referredBy) { // Verifica se o usuário foi referenciado
            const referrer = await User.findById(user.referredBy); // Encontra o usuário que referenciou
            if (referrer) {
                const referralReward = reward * 0.15; // Calcula a recompensa de referência (15% do valor da tarefa)
                referrer.balance += referralReward; // Adiciona a recompensa ao saldo do usuário referenciador
                await referrer.save(); // Salva as mudanças no usuário referenciador
            }
        }

        await user.save();
        res.json({ newBalance: user.balance });
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        res.status(500).send('Erro ao completar tarefa');
    }
});

router.get("/campaigns", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Obtém o ID do usuário logado
        const announcements = await Announcement.find({ postedBy: userId }); // Filtra campanhas pelo ID do usuário

        res.render("./dashboard/campaigns.html", {
            Page: "Campaigns",
            announcements,
            userBalance: req.userBalance,
            username: req.username
        });
    } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
        res.status(500).send('Erro ao buscar campanhas');
    }
});


router.post('/hide-announcement', authMiddleware, (req, res) => {
    const { announcementId } = req.body;

    if (!req.session.hiddenAnnouncements) {
        req.session.hiddenAnnouncements = [];
    }

    if (!req.session.hiddenAnnouncements.includes(announcementId)) {
        req.session.hiddenAnnouncements.push(announcementId);
    }

    res.sendStatus(200);
});

router.delete('/announcements/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const announcement = await Announcement.findById(id);

        if (!announcement) {
            return res.status(404).send('Announcement not found');
        }

        if (announcement.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to delete this announcement');
        }

        await announcement.remove();
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting announcement:', error);
        res.status(500).send('Error deleting announcement');
    }
});

router.get('/api/announcements', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id; // Obtém o ID do usuário logado
        const announcements = await Announcement.find({ postedBy: userId });

        res.json(announcements);
    } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
        res.status(500).send('Erro ao buscar campanhas');
    }
});

router.post('/api/announcements/pause/:taskId', authMiddleware, fetchUserDataMiddleware, async (req, res) => {
    const { taskId } = req.params;
    console.log('Task ID received:', taskId); // Debugging line

    try {
        const announcement = await Announcement.findById(taskId);

        if (!announcement) {
            return res.status(404).send('Announcement not found');
        }

        if (announcement.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to pause this announcement');
        }

        announcement.paused = true;
        await announcement.save();

        res.sendStatus(200);
    } catch (error) {
        console.error('Error pausing announcement:', error);
        res.status(500).send('Error pausing announcement');
    }
});

router.post('/api/announcements/unpause/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params;

    try {
        const announcement = await Announcement.findById(taskId);

        if (!announcement) {
            return res.status(404).send('Announcement not found');
        }

        // Verifica se o usuário logado é o criador da campanha
        if (announcement.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to unpause this announcement');
        }

        // Remove o status de pausa da campanha
        announcement.paused = false;
        await announcement.save();

        res.sendStatus(200);
    } catch (error) {
        console.error('Error unpausing announcement:', error);
        res.status(500).send('Error unpausing announcement');
    }
});

// Toggle pause/unpause
router.post('/api/announcements/toggle/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params;
    try {
        const announcement = await Announcement.findById(taskId);

        if (!announcement) {
            return res.status(404).send('Announcement not found');
        }

        // Check if the user is authorized
        if (announcement.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to modify this announcement');
        }

        // Toggle the paused state
        announcement.paused = !announcement.paused;
        await announcement.save();

        res.json({ paused: announcement.paused });
    } catch (error) {
        console.error('Error toggling announcement state:', error);
        res.status(500).send('Error toggling announcement state');
    }
});


module.exports = router;
