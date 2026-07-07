export const validationPrompt = (userPrompt, openAIResponse,geminiResponse,groqResponse) => {
    return `${userPrompt} this is the question asked by the user
    For this response from openAI -> ${openAIResponse}
    For this response from gemini -> ${geminiResponse}
    For this response from groq -> ${groqResponse}
    please select which one is the best response and give it to me in this follwing json format:
    {
    response : <response>
    model: <openAI / gemini / groq>
    }
    
    `
}