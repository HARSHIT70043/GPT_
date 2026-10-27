

import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();
const PORT = 8080;
import chartRouter from './routes/chats.js';
import getopenapiresponse from "./utils/openai.js";

app.use(express.json());
app.use(cors());
app.use("/api",chartRouter);


app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
  connectDB();
});


const connectDB=async ()=>{
  try{
    const respond =await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connect to the server MONGO_DB server");

  }catch(error){
      console.log("Failed To connect With DB",error)
  }
}
// app.post("/test", async (req, res) => {
//   const apiKey = process.env.OPENAI_API_KEY;
//   if (!apiKey) {
//     return res.status(500).json({ error: "API key is not configured." });
//   }

//   const { message } = req.body;
//   if (!message) {
//     return res.status(400).json({ error: "message is required." });
//   }

//   try {
//     const response = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${apiKey}`,
//         },
//         body: JSON.stringify({
//           model: "gemini-3.8-flash", // verify this model name
//           messages: [{ role: "user", content: message }],
//         }),
//       },
//     );
//     const data = await response.json();

//     if (!response.ok) {
//       console.error("Gemini API request failed:", response.status, data);
//       return res.status(response.status).json(data);
//     }
//     console.log(message);
//     console.log(data.choices[0].message.content);
//     // return res.json(data);
//     return res.json(data.choices[0].message.content)

//   } catch (error) {
//     console.error("Failed to call Gemini API:", error);
//     return res.status(502).json({ error: "Failed to call Gemini API." });
//   }
// });

