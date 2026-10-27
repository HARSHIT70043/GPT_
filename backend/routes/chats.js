import express from "express";
import Thread from "../models/Thread.js";
import getopenapiresponse from "../utils/openai.js";
const router =express.Router();

router.post("/test",async(req,res)=>{
    try{
        const thread=new Thread({
            threadid :"zyx909",
            title:"Last Sample"
        })
        const respond=await thread.save();
        res.send(respond)
    }catch(error){
        console.log(error);
        res.status(500).send({ error: "Fail to Save In DB", details: error.message });
    }
});





// showing the threads by individual Get All  Thread

router.get("/thread", async (req, res) => {
    try {
        const allthread = await Thread.find().sort({ updatedAt: -1 });

        res.json(allthread);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//paticular thread accesing using the threadid

router.get("/thread/:threadid", async (req, res) => {
    const { threadid } = req.params;
    try {
        const thread = await Thread.findOne({ threadid });
        if (!thread) {
            return res.status(404).json({ error: "Thread was not found" });
        }
        res.status(200).json(thread.messages);
    } catch (error) {
        console.log("failed to get the detail", error);
        res.status(500).json({ error: error.message });
    }
});


///delete the routes 

router.delete("/thread/:threadid", async (req, res) => {
    const { threadid } = req.params;
    try {
        const deleted = await Thread.findOneAndDelete({ threadid });
        if (!deleted) {
            return res.status(404).json({ error: "Thread not found" });
        }
        res.status(200).json({ success: "Thread deleted" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to delete" });
    }
});


router.post("/chats", async (req, res) => {
    const { threadid, message } = req.body;
    if (!threadid || !message) {
        return res.status(400).json({ error: "Missing required field" });
    }
    try {
        let thread = await Thread.findOne({ threadid });
        if (!thread) {
            thread = new Thread({
                threadid,
                title: message,
                messages: [{ role: "user", content: message }],
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getopenapiresponse(message);
        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();
        await thread.save();
        res.json({ reply: assistantReply });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
});

export default router