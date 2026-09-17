import express from "express";
import { validateInput, validateOutput } from "../llm/schema.js";
import OpenAI from "openai";

const app = express();
app.use(express.json());

const client = new OpenAI({
  baseURL: process.env.LLM_BASE_URL, // OpenRouter: https://openrouter.ai/api/v1
  apiKey: process.env.LLM_API_KEY, // Ollama: http://localhost:11434/v1/
});

// const res = await client.chat.completions.create({
//   model: process.env.LLM_MODEL, // "openrouter/free" or "gemma3:1b"
//   messages: [{ role: "user", content: "Reply with exactly the word: ready" }],
// });
// console.log(res.choices[0].message.content);

const enrich = async (req, res) => {
    console.log(req.body)
    const validInput = validateInput(req.body)
    if (validInput.success){
        if (process.env.LLM_STUB == 1){
            return res.status(200).json({
                title: "A Light in the Attic",
                author: "Shel Silverstein",
                confidence: 0.9
            })
        }
    }else{
        console.log("at error")
        return res.status(400).json(validInput.error)
    }
    console.log("need llm")
    return res.status(400).json({
        message: "need llm"
    })
};

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "enrich scraping",
    job: {
      title: "book title",
      author:
        'get book author from description/"Unknown" if no author if given in description',
      confidence: "0.0 - 1.0",
    },
  });
});
app.post("/enrich", enrich);

export default app;
