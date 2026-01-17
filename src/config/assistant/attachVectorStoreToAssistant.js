const axios = require("axios");

async function attachVectorStoreToAssistant(assistantId, vectorStoreId) {
  const key = process.env.OPENAI_API_KEY;

  const res = await axios.post(
    `https://api.openai.com/v1/assistants/${assistantId}`,
    {
      tool_resources: {
        file_search: {
          vector_store_ids: [vectorStoreId],
        },
      },
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );

  return res.data;
}

module.exports = { attachVectorStoreToAssistant };
