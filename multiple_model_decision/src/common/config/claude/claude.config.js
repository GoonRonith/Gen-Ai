import Anthropic from "@anthropic-ai/sdk";

const claudeClient = new Anthropic({
  apiKey: process.env["ANTHROPIC_API_KEY"] // This is the default and can be omitted
});

export default claudeClient;