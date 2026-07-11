import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import "dotenv/config";

const filePath = "./rag/internal-doc.pdf";

async function indexDocument() {
  try {
    const loader = new PDFLoader(filePath, {
      splitPages: false,
    });

    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    });

    const pageDocuments = await Promise.all(
      docs.map(async (pageDoc, pageIndex) => {
        const pageNumber =
          pageDoc.metadata?.loc?.pageNumber ?? pageIndex + 1;

        const chunks = await splitter.splitText(pageDoc.pageContent);

        const bookName =
          pageDoc.metadata?.pdf?.info?.Title ??
          pageDoc.metadata?.source?.split("/").pop() ??
          "unknown";

        return chunks.map((chunk) => ({
          pageContent: chunk,
          metadata: {
            source: `page_${pageNumber}`,
            page: pageNumber,
            bookName,
          },
        }));
      })
    );

    const documents = pageDocuments.flat();

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: "http://localhost:6333",
        collectionName: "rag-dev-collection",
      }
    );

    await vectorStore.addDocuments(documents);

    console.log(
      `Indexed ${documents.length} chunks into Qdrant successfully.`
    );
  } catch (error) {
    console.error(error);
  }
}

indexDocument();