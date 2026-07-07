import "dotenv/config"
import OpenAI from "openai";
import { tavily } from '@tavily/core'

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


async function main() {
    const messages = [
        {
            role: 'system',
            content: `you are efficient smart personal assistant who answers asked question.
                You have access to the following tools:
                    1.webSearch({query}) //search the latest information and realtime data on internet
                `
        },
        {
            role: 'user',
            content: 'How is the weather in bangalore ?'
        }
    ]
    
    while(true) {
        const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: messages,
        tools: [
            {
                type: "function",
                function: {
                    name: 'webSearch',
                    description: 'search the latest information and realtime data on the internet',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'the search query to perform search on'
                            }
                        },
                        required: ['query']
                    }
                }
            }
        ],
        tool_choice: 'auto'
    })

    messages.push(response.choices[0].message)

    const toolCall = response.choices[0].message.tool_calls
    if (!toolCall) {
        console.log(response.choices[0].message.content);
        break
    }

    for (const tool of toolCall) {

        const functionName = tool.function.name;
        const functionParams = JSON.parse(tool.function.arguments);

        if (functionName === "webSearch") {

            const toolResult = await webSearch(functionParams);

            messages.push({
                tool_call_id: tool.id,
                role: "tool",
                name: functionName,
                content: toolResult
            });
        }
    }

    // console.log(response.choices[0].message);
    }

}

main()


async function webSearch({ query }) {
    const response = await tvly.search(query)
    const finalResponse = response.results.map(result => result.content).join('\n\n')
    console.log("searching in web");
    return finalResponse
}