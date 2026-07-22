import { encodingForModel } from "js-tiktoken";

import { Document } from "@langchain/core/documents";

const encoder = encodingForModel("text-embedding-3-small");



export function semanticChunker(
    subtitles,
    {
        maxTokens = 150,
        overlapSubtitles = 2,
        maxPause = 3000,
    } = {}
) {
    const chunks = [];

    let current = [];
    let tokenCount = 0;

    for (let i = 0; i < subtitles.length; i++) {
        const subtitle = subtitles[i];

        const tokens = encoder.encode(subtitle.text).length;
        // console.log("tokens", tokens);

        const previous = current[current.length - 1];

        const hasLongPause =
            previous &&
            subtitle.start - previous.end > maxPause;

        const exceedsLimit =
            tokenCount + tokens > maxTokens;

        if (
            current.length &&
            (hasLongPause || exceedsLimit)
        ) {
            chunks.push(createChunk(current));

            current = current.slice(-overlapSubtitles);

            tokenCount = current.reduce(
                (sum, item) =>
                    sum + encoder.encode(item.text).length,
                0
            );
        }

        current.push(subtitle);

        tokenCount += tokens;
    }

    if (current.length) {
        chunks.push(createChunk(current));
    }

   
    const documents = chunks.map(
        (chunk) =>
            new Document({
                pageContent: chunk.pageContent,

                metadata: chunk.metadata,
            })
    );
    //  console.log(documents);

    return documents;
}

function createChunk(subtitles) {
    return {
        pageContent: subtitles
            .map((s) => s.text)
            .join(" "),

        metadata: {
            start: subtitles[0].start,
            end: subtitles[subtitles.length - 1].end,
            subtitleStart: subtitles[0],
            subtitleEnd: subtitles[subtitles.length - 1],
        },
    };
}

// semanticChunker(subtitles)