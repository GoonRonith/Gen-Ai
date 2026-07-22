import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import 'dotenv/config'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function msToTimestamp(ms) {
    return new Date(ms).toISOString().substr(11, 8); // HH:MM:SS
}
async function query(userQuery) {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // Use this embedding model
    {
      url: 'http://localhost:6333',
      collectionName: 'chaicode-expo-course',
    },
  );

  // get simialr vectors and chunks
  const vectorRetriver = vectorStore.asRetriever({ k: 5 });
  const results = await vectorRetriver.invoke(userQuery);
  // console.log(results);

  const context = results
    .map(
      (doc, index) => `
  Chunk ${index + 1}
  Start: ${msToTimestamp(doc.metadata.start)}
  End: ${msToTimestamp(doc.metadata.end)}

  Transcript:
  ${doc.pageContent}
  `
    )
    .join("\n\n-------------------------\n\n");
  // feed those chunks to llm model and do a simple chat with {userQuery}
  const SYSTEM_PROMPT = `
    You are an AI assistant that answers questions only from the provided transcript.

    Rules:
    - Use ONLY the transcript below.
    - If the answer is not present, say "I couldn't find it."
    - Mention the timestamp in HH:MM:SS format.
    - Quote the relevant explanation briefly.

    Transcript:
    ${context}
    `;

  const llmResponse = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userQuery },
    ],
  });

  console.log(`LLM Response:`, llmResponse.choices[0].message.content);
}

query('In the lecture when exactly the teacher was saying types of mobile apps and when discuss about the 3rd one?');