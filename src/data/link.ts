import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { Links } from '../types/link';

const generalSchema = new Mongoose.Schema({
  description: { type: String, required: true, maxLength: 50 },
  link: { type: String, required: true },
});

const themeSchema = new Mongoose.Schema({
  title: { type: String, required: true, maxLength: 50 },
  links: [generalSchema],
});

const linkSchema = new Mongoose.Schema(
  {
    userId: { type: String, required: true },
    youtube: String,
    twitter: String,
    tiktok: String,
    instagram: String,
    facebook: String,
    telegram: String,
    general: [themeSchema],
  },
  { timestamps: true }
);

MongoDB.useVirtualId(generalSchema);
MongoDB.useVirtualId(themeSchema);
MongoDB.useVirtualId(linkSchema);
const LinkModel = Mongoose.model('Link', linkSchema);

export async function createLinks(links: Links) {
  const result = await LinkModel.create(links);
  return result.id;
}

export async function updateLinks(links: Links) {
  const result = await LinkModel.findOneAndUpdate({ uesrId: links.userId }, links, { returnOriginal: false });
  return Links.parse(result);
}

export async function findLinksByUserId(uesrId: string) {
  const result = await LinkModel.findOne({ uesrId });
  return Links.parse(result);
}
