import { validationPrompt } from "../../common/config/prompts/finalResultValidationPrompt.js"
import { sendPromptToGemini } from "../../common/utils/gemini.utils.js"
import { sendPromptToGroq } from "../../common/utils/groq.utils.js"
import { sendPromptToOpenAI } from "../../common/utils/openai.utils.js"

export class ChatController {
    async handlePostChatController(req,res,next) {
        try {
            const prompt = req.body.prompt
            const [openAIResponse, geminiResponse, groqResponse] = await Promise.all([
                sendPromptToOpenAI(prompt),
                sendPromptToGemini(prompt),
                sendPromptToGroq(prompt)
            ]);
            const finalPrompt= validationPrompt(openAIResponse,geminiResponse,groqResponse)
            const finalResponse = await sendPromptToOpenAI(finalPrompt,`You are an expert AI reviewer. Your role is to evaluate the provided content objectively and impartially. Provide a detailed, fair, and evidence-based review, identifying strengths, weaknesses, potential issues, and areas for improvement. Avoid bias, unsupported assumptions, and personal preferences. Ensure your feedback is clear, constructive, and actionable.`)
            
            res.json({success:'ok',optimize_response:JSON.parse(finalResponse)})
            
        } catch (error) {
            next(error)
        }
    }
}