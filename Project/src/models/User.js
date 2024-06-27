const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const TaskSchema = new mongoose.Schema({
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' },
    dateCompleted: { type: Date, required: true },
    earnings: { type: Number, required: true, default: 0 }
});

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    balance: { type: Number, default: 0.0 },
    referenceCode: { type: String, default: null },
    tasks: [TaskSchema]
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
