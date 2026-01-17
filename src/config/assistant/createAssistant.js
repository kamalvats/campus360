const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function createAssistantCampus360() {
  const key = process.env.OPENAI_API_KEY;

  // ✅ read system prompt from file
  const systemPromptPath = path.join(path.resolve(__dirname+"/campus360.system.txt"));
  const systemPrompt = fs.readFileSync(systemPromptPath, "utf-8");

  const url = "https://api.openai.com/v1/assistants";

  const body = {
    name: "Campus360",
    instructions: systemPrompt,
    model: "gpt-4o-mini",
    tools: [
      { type: "file_search" } // ✅ scalable method (RAG)
    ],
  };

  const res = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "OpenAI-Beta": "assistants=v2",
    },
  });

  return res.data;
}

module.exports = { createAssistantCampus360 };
