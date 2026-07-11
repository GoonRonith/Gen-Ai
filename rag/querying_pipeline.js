import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import OpenAI from 'openai';
import 'dotenv/config'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function query(userQuery) {
  const embeddings = new OpenAIEmbeddings({
    model: 'text-embedding-3-small',
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(
    embeddings, // Use this embedding model
    {
      url: 'http://localhost:6333',
      collectionName: 'rag-dev-collection',
    },
  );

  // get simialr vectors and chunks?
  const vectorRetriver = vectorStore.asRetriever({ k: 5 });
  const results = await vectorRetriver.invoke(userQuery);
  
  // feed those chunks to llm model and do a simple chat with {userQuery}
  const SYSTEM_PROMPT = `
    You are an expert in answereing user query based on the provided context about document.
    Do not answere anything beyond what is not provided.

    Always also answer the user in short and tell on which page number that content is available and also name of the book

    User Documents:
    ${results.map((e) => JSON.stringify({ bookName: e.metadata.bookName, pageContent: e.pageContent, pageNumber: e.metadata.source })).join('\n\n')}
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

query('what is Cloud Transcoding');