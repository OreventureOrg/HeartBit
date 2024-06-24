const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const authMiddleware = require('../middleware/authMiddleware');

// Endpoint para saque
router.post('/', authMiddleware, async (req, res) => {
  const { amount } = req.body;
  const userId = req.session.userId;

  if (!userId || !amount) {
    return res.status(400).json({ message: 'Missing userId or amount' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    user.balance -= amount;
    await user.save();

    const transaction = new Transaction({
      userId,
      amount,
      type: 'withdraw'
    });
    await transaction.save();

    res.status(200).json({ message: 'Withdrawal successful', balance: user.balance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
