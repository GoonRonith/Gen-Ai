
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

export async function vectorEmbeddingAndStoreInVectorStore() {
    try {
        const embeddings = new OpenAIEmbeddings({
            model: "text-embedding-3-small",
        });
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: "http://localhost:6333",
                collectionName: "chaicode-expo-course",
            }
        );

        return vectorStore;
    } catch (error) {
        console.error(error);
    }
}

vectorEmbeddingAndStoreInVectorStore();