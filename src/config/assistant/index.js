require("dotenv").config();

const { createAssistantCampus360 } = require("./createAssistant");
const { uploadCampusDataFile } = require("./uploadCampusData");
const { createVectorStoreWithFile } = require("./createVectorStore");
const { attachVectorStoreToAssistant } = require("./attachVectorStoreToAssistant");

async function main() {
  // ✅ 1. Create assistant with prompt from file
  const assistant = await createAssistantCampus360();
  console.log("✅ Assistant Created:", assistant);

  // ✅ 2. Upload campusData.json file
  const file = await uploadCampusDataFile();
  console.log("✅ File Uploaded:", file);

  // ✅ 3. Create vector store + attach file
  const vectorStoreId = await createVectorStoreWithFile(file.id);
  console.log("✅ Vector Store Created:", vectorStoreId);

  // ✅ 4. Attach vector store to assistant
  const updated = await attachVectorStoreToAssistant(assistant.id, vectorStoreId);
  console.log("✅ Assistant Updated with File Search:", updated);
}

// main().catch(console.error.data);
