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
            postedBy: req.user._id
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

        const poster = await User.findById(announcementObj.postedBy);
        if (poster) {
            poster.balance -= penalty;
            await poster.save();
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
<<<<<<< Updated upstream
=======

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

router.post('/api/announcements/pause/:taskId', authMiddleware,fetchUserDataMiddleware, async (req, res) => {
    const { taskId } = req.params;

    try {
        const announcement = await Announcement.findById(taskId);

        if (!announcement) {
            return res.status(404).send('Announcement not found');
        }

        // Verifica se o usuário logado é o criador da campanha
        if (announcement.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).send('You are not authorized to pause this announcement');
        }

        // Define o status de pausa da campanha (exemplo: usando um campo "paused" no modelo Announcement)
        announcement.paused = true;
        await announcement.save();

        res.sendStatus(200);
    } catch (error) {
        console.error('Error pausing announcement:', error);
        res.status(500).send('Error pausing announcement');
    }
});


>>>>>>> Stashed changes
module.exports = router;
