const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword, firstName, lastName } = req.body;

    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
        return res.render('auth/register.html', { errorMessage: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.render('auth/register.html', { errorMessage: 'Passwords do not match.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register.html', { errorMessage: 'Email already in use.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, firstName, lastName });
        await user.save();
        res.redirect('/login');
    } catch (error) {
        res.render('auth/register.html', { errorMessage: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/login.html', { errorMessage: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('auth/login.html', { errorMessage: 'Incorrect password.' });
        }

        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (error) {
        res.render('auth/login.html', { errorMessage: error.message });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

module.exports = { registerUser, loginUser, logoutUser };
