const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword, firstName, lastName, referenceCode } = req.body;

    if (!username || !email || !password || !confirmPassword || !firstName || !lastName) {
        return res.render('auth/register.html', { errorMessage: 'All fields are required.', referenceCode });
    }

    if (password !== confirmPassword) {
        return res.render('auth/register.html', { errorMessage: 'Passwords do not match.', referenceCode });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.render('auth/register.html', { errorMessage: 'Email already in use.', referenceCode });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            referenceCode: referenceCode || null
        });

        await newUser.save();

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
        if (err) return res.redirect('/');

        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

module.exports = { registerUser, loginUser, logoutUser };
