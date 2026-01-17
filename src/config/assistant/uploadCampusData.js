const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

async function uploadCampusDataFile() {
  const key = process.env.OPENAI_API_KEY;

  const filePath = path.join(path.resolve(__dirname+"/campusData.json"));

  const form = new FormData();
  form.append("purpose", "assistants");
  form.append("file", fs.createReadStream(filePath));

  const res = await axios.post("https://api.openai.com/v1/files", form, {
    headers: {
      Authorization: `Bearer ${key}`,
      ...form.getHeaders(),
    },
  });

  return res.data; // includes file.id
}

module.exports = { uploadCampusDataFile };
