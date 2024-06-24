const express = require('express');
const router = express.Router();
const Announcement = require('../models/announcement');

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
        res.redirect('/announcement');
    } catch (error) {
        console.error('Error creating announcement:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
