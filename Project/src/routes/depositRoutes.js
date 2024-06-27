const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint para depósito
router.post('/', authMiddleware, async (req, res) => {
    const { amount } = req.body;
    const userId = req.session.userId;

    if (!userId || !amount) {
        return res.status(400).json({ message: 'Missing userId or amount', userBalance: req.userBalance });
    }

    try {
        // Convertendo a quantidade para número
        const depositAmount = parseFloat(amount);

        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: 'Invalid deposit amount' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Adicionando ao saldo atual do usuário
        user.balance += depositAmount;
        await user.save();

        // Registrando a transação
        const transaction = new Transaction({
            userId,
            amount: depositAmount,
            type: 'deposit'
        });
        await transaction.save();

        res.status(200).json({ message: 'Deposit successful', balance: user.balance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
