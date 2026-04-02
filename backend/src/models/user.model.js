import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
  createdAt: { type: Date, default: Date.now }
});


userSchema.pre('save', async function() {
  // 1. Only hash if the password is new or being changed
  if (!this.isModified('password')) return;

  try {
    // 2. Hash and replace
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    // In async hooks, throwing an error automatically passes it to the next() middleware
    throw new Error("Password hashing failed: " + error.message);
  }
});

export const User = mongoose.model('User', userSchema);