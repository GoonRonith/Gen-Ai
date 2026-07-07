import "dotenv/config";

import { webSearch } from "../config/tools/webSearch.tool.js";
import geminiClient from "../config/gemini/gemini.config.js";

export async function sendPromptToGemini(prompt) {
  let contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  while (true) {
    const response = await geminiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      
      config: {
        systemInstruction: `You are an efficient smart personal assistant.

You have access to the following tool:

1. webSearch({query})
- Search the latest information and realtime data on the internet.`,
        maxOutputTokens:1000,
        tools: [
          {
            functionDeclarations: [
              {
                name: "webSearch",
                description:
                  "Search the latest information and realtime data on the internet",
                parameters: {
                  type: "OBJECT",
                  properties: {
                    query: {
                      type: "STRING",
                      description: "The search query",
                    },
                  },
                  required: ["query"],
                },
              },
            ],
          },
        ],
      },
    });

    const parts = response.candidates[0].content.parts;

    const functionCall = parts.find((part) => part.functionCall);

    // No function call => final answer
    if (!functionCall) {
      // console.log(response.text);
      return response.text
      break;
    }

    const { name, args } = functionCall.functionCall;

    if (name === "webSearch") {
      const result = await webSearch(args);

      // Save model's function call
      contents.push({
        role: "model",
        parts,
      });

      // Send tool result back
      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name,
              response: {
                result,
              },
            },
          },
        ],
      });
    }
  }
}

