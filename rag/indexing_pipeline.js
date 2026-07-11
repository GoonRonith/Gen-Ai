import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';
import 'dotenv/config'

const filePath = './rag/internal-doc.pdf'

async function indexDocument() {
    try {
        const loader = new PDFLoader(filePath, { splitPages: false })
        const doc = await loader.load()

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 100 })
        const texts = await splitter.splitText(doc[0].pageContent)

        const document = texts.map((text, index) => ({
            pageContent: text,
            metadata: { source: `page_${index + 1}` }
        }))

        // Initalize the embedding model
        const embeddings = new OpenAIEmbeddings({
            model: 'text-embedding-3-small',
        });

        // The vector store
        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings, // Use this embedding model
            {
                url: 'http://localhost:6333',
                collectionName: 'rag-dev-collection',
            },
        );
        await vectorStore.addDocuments(document);

        console.log(`All the documents are indexed....`);

        // console.log(documents);
    } catch (error) {
        console.log(error);

    }

}

indexDocument()




