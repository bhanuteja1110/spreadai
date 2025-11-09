// Minimal interface; swap implementation for Pinecone/Chroma/Weaviate

const vectors = [];

export default {
  async add(id, text, embedding) {
    vectors.push({ id, text, embedding });
    return true;
  },

  async search(queryEmbeddingOrText, topK = 3) {
    // TODO: call embeddings endpoint, compute similarity, return topK
    return [];
  }
};

