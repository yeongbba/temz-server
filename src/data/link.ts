import Mongoose from 'mongoose';
import { MongoDB } from '../database/mongo';
import { GeneralLinks, SocialLinks } from '../types/link';

const socialSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
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
});

const themeSchema = new Mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true, maxLength: 50 },
  links: [generalSchema],
});

MongoDB.useVirtualId(generalSchema);
MongoDB.useVirtualId(themeSchema);
MongoDB.useVirtualId(socialSchema);
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
  const result = await GeneralModel.findByIdAndUpdate(links.linkId, links, { returnOriginal: false });
  return GeneralLinks.parse(result);
}

export async function findThemesByUserId(userId: string) {
  const result = await GeneralModel.find({ userId });
  return result?.map((theme) => GeneralLinks.parse(theme));
}

export async function removeGeneralLinks(linkId: string) {
  const result = await GeneralModel.findByIdAndRemove(linkId, { returnOriginal: false });
  return GeneralLinks.parse(result);
}
