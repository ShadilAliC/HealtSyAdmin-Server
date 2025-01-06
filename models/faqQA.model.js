import mongoose from "mongoose";

const FaqQASchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

export default FaqQASchema;
