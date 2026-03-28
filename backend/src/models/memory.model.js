import mongoose from 'mongoose';


const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pineconeId: { type: String, required: true },
  content: { type: String, required: true },
  summary: { type: String },
  tags: [String],
  type: { type: String, default: 'text' },
  fileUrl: { type: String }, 
  isFavorite: { type: Boolean, default: false }
}, { timestamps: true });


export const Memory = mongoose.model('Memory', memorySchema);