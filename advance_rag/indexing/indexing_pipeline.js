import { vectorEmbeddingAndStoreInVectorStore } from "./vectror_embedding/vectorEmbedding.js";
import { semanticChunker } from "./chunker/semanticChunker.js";
import { parseSrtFileToChunks } from "./loader/srtLoader.js";

export async function indexingPipeline() {
    try {

        const subtitles = parseSrtFileToChunks('./advance_rag/sub01.srt')
        const documents = semanticChunker(subtitles)
        const vectorStore = await vectorEmbeddingAndStoreInVectorStore()

        await vectorStore.addDocuments(documents);

        console.log(
            `Indexed ${documents.length} chunks into Qdrant successfully.`
        );
    } catch (error) {
        console.error(error);
    }
}

indexingPipeline()