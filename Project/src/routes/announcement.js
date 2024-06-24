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

        const announcements = await Announcement.find({
            platform,
            action,
            _id: { $nin: user.tasks }
        });

        res.render("./earn/earn.html", {
            Page: "Earn",
            platform,
            action,
            announcements,
            userBalance: req.userBalance
        });
    } catch (error) {
        console.error('Erro ao buscar anúncios:', error);
        res.status(500).send('Erro ao buscar anúncios');
    }
});


router.post('/announcement', async (req, res) => {
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
            rewardPerAction: parseFloat(rewardPerAction),
            dailyLimit: parseInt(dailyLimit) || 0,
            overallLimit: parseInt(overallLimit) || 0
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

        user.tasks.push(announcementId);
        user.balance += announcementObj.rewardPerAction;

        await user.save();

        res.redirect(`/earn/${announcementObj.platform}/${announcementObj.action}`);
    } catch (error) {
        console.error('Erro ao completar tarefa:', error);
        res.status(500).send('Erro ao completar tarefa');
    }
});

module.exports = router;
