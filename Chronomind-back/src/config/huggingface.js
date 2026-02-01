 import axios from "axios";

console.log("HF_API_KEY NO HF:", process.env.HF_API_KEY);

 export const hfClient = axios.create({
    baseURL: "https://router.huggingface.co/hf-inference/models/",
    headers: {
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
    "Content-Type": "application/json"
    }
 });