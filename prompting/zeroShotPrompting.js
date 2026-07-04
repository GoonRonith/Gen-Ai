import "dotenv/config"
import OpenAI from "openai";


const client = new OpenAI({
    apiKey : process.env.OPENAI_API_KEY
})

async function main() {
    const response = await client.chat.completions.create({
        model:"gpt-4.1-mini",
        messages :[
            {
                role : 'user',
                content : 'who is the opponent of brazil in world cup 2026 in Round of 16 ?'
            }
        ]
    })

    console.log(response.choices[0].message.content)
}


main()
