const express = require("express");
const router = express.Router();

const assistantController = require("./controller");

router.post("/create-thread", assistantController.createThread);
// ✅ Chat in a thread (send msg + get response)
router.post("/chat", assistantController.chatWithAssistant);

module.exports = router;
