import "dotenv/config"
import openAIClient from "../config/openai/openai.config.js";
import { webSearch } from "../config/tools/webSearch.tool.js";

export async function sendPromptToOpenAI(prompt, systemPrompt = null) {
    let response = await openAIClient.responses.create({
        model: 'gpt-4.1-mini',
        max_output_tokens: 1000,
        instructions: systemPrompt ? systemPrompt : `You are an efficient smart personal assistant.

        //     You have access to the following tool:

        //     1. webSearch({query})
        //     - Search the latest information and realtime data on the internet.`,
        // instructions: `You are an efficient smart personal assistant.

        //     You have access to the following tool:

        //     1. webSearch({query})
        //     - Search the latest information and realtime data on the internet.`,
        input: prompt,
        tools: [
            {
                type: "function",
                name: "webSearch",
                description:
                    "Search the latest information and realtime data on the internet",
                parameters: {
                    type: "object",
                    properties: {
                        query: {
                            type: "string",
                            description: "The search query",
                        },
                    },
                    required: ["query"],
                },
            },
        ],
    })

    while (true) {
        // Find function calls
        const functionCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        // No tool call -> final answer
        if (functionCalls.length === 0) {
            // console.log(response.output_text);
            return response.output_text
            break;
        }

        const toolOutputs = [];

        for (const call of functionCalls) {
            const functionName = call.name;
            const args = JSON.parse(call.arguments);

            if (functionName === "webSearch") {
                const result = await webSearch(args);

                toolOutputs.push({
                    type: "function_call_output",
                    call_id: call.call_id,
                    output: result,
                });
            }
        }

        // Continue reasoning
        response = await openAIClient.responses.create({
            model: "gpt-4.1-mini",
            previous_response_id: response.id,
            input: toolOutputs,
            tools: [
                {
                    type: "function",
                    name: "webSearch",
                    description:
                        "Search the latest information and realtime data on the internet",
                    parameters: {
                        type: "object",
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query",
                            },
                        },
                        required: ["query"],
                    },
                },
            ],
        });
    }
}



