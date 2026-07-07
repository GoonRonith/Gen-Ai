import tvly from "../tavily/tavily.config.js";

export async function webSearch({ query }) {
    console.log("Searching on the web...");

    const response = await tvly.search(query);

    return response.results
        .map((result) => result.content)
        .join("\n\n");
}