const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ActionSchema = new mongoose.Schema({
    value: { type: Number, required: true },
    date: { type: Date, required: true }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    balance: { type: Number, default: 0.0 },
    referenceCode: { type: String, default: null },
    tasks: { type: [mongoose.Schema.Types.ObjectId], ref: 'Announcement', default: [] },
    actionsDoneToday:{ type: Number, default: 0 },
    actionsDoneTotal:{ type: Number, default: 0 },
    earnedToday:{ type: Number, default: 0.0000 },
    earnedTotal:{ type: Number, default: 0.0000 }
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
