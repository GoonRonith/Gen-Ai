import "dotenv/config";
import claudeClient from "../config/claude/claude.config.js";
import { webSearch } from "../config/tools/webSearch.tool.js";



export async function sendPromptToClaude(prompt) {
  let messages = [
    {
      role: "user",
      content: prompt,
    },
  ];

  while (true) {
    const response = await claudeClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,

      system: `You are an efficient smart personal assistant.
        You have access to the following tool:
        1. webSearch({query})
        - Search the latest information and realtime data on the internet.`,
      messages,
      tools: [
        {
          name: "webSearch",
          description:
            "Search the latest information and realtime data on the internet",
          input_schema: {
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

    // Claude wants to call a tool
    if (response.stop_reason === "tool_use") {
      const toolResults = [];

      for (const content of response.content) {
        if (content.type !== "tool_use") continue;

        if (content.name === "webSearch") {
          const result = await webSearch(content.input);

          toolResults.push({
            type: "tool_result",
            tool_use_id: content.id,
            content: result,
          });
        }
      }

      // Save Claude's assistant message
      messages.push({
        role: "assistant",
        content: response.content,
      });

      // Send tool results back
      messages.push({
        role: "user",
        content: toolResults,
      });

      continue;
    }

    // Final answer
    console.log(response.content[0].text);
    break;
  }
}

