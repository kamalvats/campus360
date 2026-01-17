const assistantService = require("../../services/user.service");
const { sendSuccess, sendError } = require("../../utiles/response");

// ✅ Create Thread Controller
const createThread = async (req, res) => {
  try {
    const thread = await assistantService.createThread();
    return sendSuccess(res, 201, "Thread created successfully", thread);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// ✅ Chat Controller
const chatWithAssistant = async (req, res) => {
  try {
    const { threadId, message } = req.body;

    if (!message) {
      return sendError(res, 400, "Message is required");
    }

    const response = await assistantService.chatWithAssistant({
      threadId,
      message,
    });

    return sendSuccess(res, 200, "Response fetched successfully", response);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

module.exports = { createThread, chatWithAssistant };
