import mongoose from "mongoose";

const newsArticleSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    image: { type: String, default: "" },
  },
  { timestamps: true },
);

export const NewsArticle = mongoose.model("NewsArticle", newsArticleSchema);
