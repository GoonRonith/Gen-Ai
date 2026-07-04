import "dotenv/config"
import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
    const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful programming teacher."
            },
            {
                role: "user",
                content: "What is Git?"
            },
            {
                role: "assistant",
                content:
                    "Git is a version control system that helps developers track changes in their code. Think of it like a time machine for your project—you can save versions, undo mistakes, and collaborate with others."
            },
            {
                role: "user",
                content: "What is Kubernetes?"
            },
            {
                role: "assistant",
                content:
                    "Kubernetes is a container orchestration platform. It automatically deploys, manages, and scales containers like Docker containers, making it easier to run applications in production."
            },

            {
                role: "user",
                content: "What is Docker?"
            }
        ]
    });

    console.log(response.choices[0].message.content);
}

main();