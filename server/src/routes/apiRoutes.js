const express = require('express');
const NotificationController = require('../controllers/api/NotificationController');

const router = express.Router();

// Stripe notification endpoints
router.post('/notify-credits-update', (req, res) => {
    NotificationController.notifyCreditsUpdate(req, res);
});

router.post('/notify-inventory-update', (req, res) => {
    NotificationController.notifyInventoryUpdate(req, res);
});

module.exports = router;