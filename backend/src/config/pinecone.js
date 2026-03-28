import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

export const pineconeIndex = pc.index('braniac-vault'); 

console.log("🌲 Pinecone connected to index: cohort-2-rag");