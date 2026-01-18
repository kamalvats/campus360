const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

// ✅ Create thread
const createThread = async () => {
  const thread = await openai.beta.threads.create();
  return { threadId: thread.id };
};

// ✅ Chat with assistant (create msg + run + get response)
const chatWithAssistant = async ({ threadId, message }) => {
  if (!message) throw new Error("Message is required");
const authFlag = true // example
// cityId:CITY_001
// locationId:LOC_001
// floorId:FLR_001
// userId:U_001
message = `auth:${authFlag}

---
UserMessage:${message}`;


  // ✅ Create thread if not provided
  let finalThreadId = threadId;
  if (!finalThreadId) {
    const newThread = await openai.beta.threads.create();
    finalThreadId = newThread.id;
  }

  // ✅ safety check
  if (!finalThreadId) throw new Error("Thread ID is undefined after creation");

  // ✅ add user msg
  await openai.beta.threads.messages.create(finalThreadId, {
    role: "user",
    content: message,
  });

  // ✅ BEST & SAFE WAY: run + poll together
  const run = await openai.beta.threads.runs.createAndPoll(finalThreadId, {
    assistant_id: ASSISTANT_ID,
    response_format: { type: "json_object" },
  });

  if (run.status !== "completed") {
    throw new Error(`Run failed: ${run.status}`);
  }

  // ✅ fetch messages
  const messages = await openai.beta.threads.messages.list(finalThreadId, {
    limit: 20,
  });

  const lastAssistantMessage = messages.data.find((m) => m.role === "assistant");

  const text =
    lastAssistantMessage?.content?.[0]?.text?.value || "No response found";

    let parsedResponse = text;

try {
  parsedResponse = JSON.parse(text);
} catch (err) {
  // If assistant didn't return valid JSON, keep raw string (optional)
  parsedResponse = { followUp: true, message: text };
}

return {
  threadId: finalThreadId,
  response: parsedResponse, // ✅ now real JSON object
};
};

module.exports = { createThread, chatWithAssistant };
