const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

router.get("/health", chatController.checkHealth);
router.post("/chat", chatController.handleChat);
router.post("/send-summary", chatController.handleSendSummary);

module.exports = router;
