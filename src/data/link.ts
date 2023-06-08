import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { GeneralLinks, SocialLinks } from '../types/link';

const socialSchema = new Mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  linkId: { type: String, unique: true },
  youtube: String,
  twitter: String,
  tiktok: String,
  instagram: String,
  facebook: String,
  telegram: String,
});

const generalSchema = new Mongoose.Schema({
  description: { type: String, required: true, maxLength: 50 },
  link: { type: String, required: true },
  viewCount: { type: Number, required: true, default: 0 },
});

const themeSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  linkId: { type: String, unique: true },
  title: { type: String, required: true, maxLength: 50 },
  links: [generalSchema],
});

socialSchema.index({ userId: 1, linkId: 1 });
themeSchema.index({ userId: 1, linkId: 1 });
MongoDB.useVirtualId(generalSchema);
MongoDB.useVirtualId(themeSchema);
MongoDB.useVirtualId(socialSchema);
MongoDB.pre(socialSchema, 'linkId');
MongoDB.pre(themeSchema, 'linkId');

const SocialModel = Mongoose.model('Social', socialSchema);
const GeneralModel = Mongoose.model('General', themeSchema);

export async function createSocialLinks(links: SocialLinks) {
  const result = await SocialModel.create(links);
  return result.id;
}

export async function updateSocialLinks(links: SocialLinks) {
  const result = await SocialModel.findOneAndUpdate({ userId: links.userId }, links, { returnOriginal: false });
  return SocialLinks.parse(result);
}

export async function findSocialLinksByUserId(userId: string) {
  const result = await SocialModel.findOne({ userId });
  return SocialLinks.parse(result);
}

export async function createGeneralLinks(links: GeneralLinks) {
  const result = await GeneralModel.create(links);
  return result.id;
}

export async function updateGeneralLinks(links: GeneralLinks) {
  const result = await GeneralModel.findOneAndUpdate({ userId: links.userId, linkId: links.linkId }, links, {
    returnOriginal: false,
  });
  return GeneralLinks.parse(result);
}

export async function findThemesByUserId(userId: string) {
  const result = await GeneralModel.find({ userId });
  return result?.map((theme) => GeneralLinks.parse(theme));
}

export async function removeGeneralLinks(userId: string, linkId: string) {
  const result = await GeneralModel.findOneAndRemove({ userId, linkId }, { returnOriginal: false });
  return GeneralLinks.parse(result);
}
