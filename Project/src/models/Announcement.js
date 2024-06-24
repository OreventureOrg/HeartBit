const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    platform: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    youtubeUrl: {
        type: String
    },
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String
    },
    rewardPerAction: {
        type: Number,
        required: true,
        min: 0.001
    },
    dailyLimit: {
        type: Number,
        default: 1,
        min: 0
    },
    overallLimit: {
        type: Number,
        default: 10,
        min: 0
    },
    accessCount: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Announcement', announcementSchema);
