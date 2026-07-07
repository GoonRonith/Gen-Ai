import "dotenv/config";
import OpenAI from "openai";
import { tavily } from "@tavily/core";

const tvly = tavily({
    apiKey: process.env.TAVILY_API_KEY,
});

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    let response = await client.responses.create({
        model: "gpt-4.1-mini",

        instructions: `
            You are an efficient smart personal assistant.

            You have access to the following tool:

            1. webSearch({query})
            - Search the latest information and realtime data on the internet.
`,

        input: "How is the weather in Bangalore?",

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

    while (true) {
        // Find function calls
        const functionCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        // No tool call -> final answer
        if (functionCalls.length === 0) {
            console.log(response.output_text);
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
        response = await client.responses.create({
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

main();

async function webSearch({ query }) {
    console.log("Searching on the web...");

    const response = await tvly.search(query);

    return response.results
        .map((result) => result.content)
        .join("\n\n");
}