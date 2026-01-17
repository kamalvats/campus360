const axios = require("axios");

async function createVectorStoreWithFile(fileId) {
  const key = process.env.OPENAI_API_KEY;

  // ✅ Create vector store
  const storeRes = await axios.post(
    "https://api.openai.com/v1/vector_stores",
    { name: "Campus360-Knowledge-Base" },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );

  const vectorStoreId = storeRes.data.id;

  // ✅ Attach file into vector store
  await axios.post(
    `https://api.openai.com/v1/vector_stores/${vectorStoreId}/files`,
    { file_id: fileId },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );

  return vectorStoreId;
}

module.exports = { createVectorStoreWithFile };
