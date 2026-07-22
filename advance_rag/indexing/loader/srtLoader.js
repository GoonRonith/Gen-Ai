import fs from "fs";
import path from "path";
import { parseSync } from "subtitle";


export function parseSrtFileToChunks(srtPath, chunkSeconds = 75) {
    const raw = fs.readFileSync(srtPath, "utf-8");
    const subtitles = parseSync(raw)
        .filter((n) => n.type === "cue")
        .map((n) => n.data);


    return subtitles
}



// parseSrtFileToChunks('../sub01.srt')