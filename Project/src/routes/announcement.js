const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get("/earn/:platform/:action", authMiddleware, async (req, res) => {
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
            _id: { $nin: user.tasks }
        });

        // Filtra anúncios escondidos
        if (req.session.hiddenAnnouncements) {
            announcements = announcements.filter(announcement => 
                !req.session.hiddenAnnouncements.includes(announcement._id.toString())
            );
        }

        res.render("./earn/earn.html", {
            Page: "Earn",
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

        if (!user.tasks) {
            user.tasks = [];
        }

        const taskCompleted = user.tasks.includes(announcementId);

        if (taskCompleted) {
            return res.status(400).send('Task already completed');
        }

        if (isNaN(announcementObj.rewardPerAction)) {
            return res.status(400).send('Invalid reward value');
        }

        const reward = announcementObj.rewardPerAction;
        const penalty = reward * 2;

        user.tasks.push(announcementId);
        user.balance += reward;

        // Atualizar contadores de ações e ganhos
        user.actionsDoneToday += 1;
        user.actionsDoneTotal += 1;
        user.earnedToday += reward;
        user.earnedTotal += reward;

        const poster = await User.findById(announcementObj.postedBy);
        if (poster) {
            poster.balance -= penalty;
            await poster.save();
        }

        await user.save();

        res.redirect(`/earn/${announcementObj.platform}/${announcementObj.action}`);
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        res.status(500).send('Erro ao completar tarefa');
    }
});


router.get("/campaigns", authMiddleware, async (req, res) => {
    try {
        const announcements = await Announcement.find({});
        res.render("./dashboard/campaigns.html", { Page: "Campaigns", announcements, userBalance: req.userBalance, username: req.username });
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        res.status(500).send('Erro ao buscar anúncios');
    }
});

// Adiciona a rota para esconder anúncios
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

module.exports = router;
