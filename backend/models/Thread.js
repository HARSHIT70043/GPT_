import mongoose from "mongoose";
import { Content } from "openai/resources/skills.mjs";


const MessageSchema= new mongoose.Schema({
    role :{
        type: String ,
        enum:["user","assistant"],
        require:true,
    },
    content :{
        type :String,
        require :true,
    },
    timestamp :{
        type: Date,
        default :Date.now,
    },
})

const ThreadSchema =new mongoose.Schema({
    threadid :{
        type :String,
        unique:true,
        require:true,
    },
    title :{
        type :String,
        default:"NEW CHART"
    },
    messages :[MessageSchema],

    createdAt :{
        type:Date,
        default:Date.now,
    },
    updatedAt :{
        type:Date,
        default:Date.now,
    },
});

export default mongoose.model("Thread",ThreadSchema);
