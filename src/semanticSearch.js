import { pipeline } from "@xenova/transformers";
import documents from "./documents.json" assert { type: "json" };

let extractor;

async function loadModel() {

  if (!extractor) {

    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

  }

}

async function embed(text) {

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true
  });

  return Array.from(output.data);

}

function cosineSimilarity(a, b) {

  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);

  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));

  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  return dot / (magA * magB);

}

export default async function semanticSearch(query) {

  await loadModel();

  const queryEmbedding = await embed(query);

  const scoredDocs = [];

  for (const doc of documents) {

    const docEmbedding = await embed(doc.text);

    const score = cosineSimilarity(queryEmbedding, docEmbedding);

    scoredDocs.push({
      text: doc.text,
      score
    });

  }

  scoredDocs.sort((a, b) => b.score - a.score);

  return scoredDocs.slice(0, 3).map(d => d.text);

}