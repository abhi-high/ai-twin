import documents from "./documents.json" assert { type: "json" };

export default async function semanticSearch(query) {

  const q = query.toLowerCase();

  const results = documents.filter(doc =>
    doc.text.toLowerCase().includes(q)
  );

  if (results.length === 0) {

    return documents.slice(0,3).map(d=>d.text);

  }

  return results.slice(0,3).map(d=>d.text);

}