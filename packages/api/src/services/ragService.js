import vectorStore from '../db/vectorStore.js';

export default {
  async retrieveRelevant(query, topK = 3) {
    // returns array of { id, text, score }
    return vectorStore.search(query, topK);
  }
};

