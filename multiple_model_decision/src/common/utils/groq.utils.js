import "dotenv/config";
import Groq from "groq-sdk";
import { webSearch } from "../config/tools/webSearch.tool.js";
import groqClient from "../config/groq/groq.config.js";


export async function sendPromptToGroq(prompt) {
  const messages = [
    {
      role: "system",
      content: `You are an efficient smart personal assistant.

You have access to the following tool:

1. webSearch({query})
- Search the latest information and realtime data on the internet.`,
    },
    {
      role: "user",
      content: prompt,
    },
  ];

  while (true) {
    const response = await groqClient.chat.completions.create({
      model: "openai/gpt-oss-120b", 
      messages,
      max_completion_tokens:1000,
      tools: [
        {
          type: "function",
          function: {
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
        },
      ],

      tool_choice: "auto",
    });

    const assistantMessage = response.choices[0].message;

    messages.push(assistantMessage);

    // No tool call => final answer
    if (!assistantMessage.tool_calls) {
      // console.log(assistantMessage.content);
      return assistantMessage.content
      break;
    }

    // Execute each tool
    for (const toolCall of assistantMessage.tool_calls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);

      if (functionName === "webSearch") {
        const result = await webSearch(args);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: functionName,
          content: result,
        });
      }
    }
  }
}

