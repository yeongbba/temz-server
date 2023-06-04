export class SocialLinks {
  linkId?: string;
  userId?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;

  constructor(link?: {
    id?: string;
    userId?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
  }) {
    this.linkId = link?.id;
    this.userId = link?.userId;
    this.youtube = link?.youtube;
    this.twitter = link?.twitter;
    this.tiktok = link?.tiktok;
    this.instagram = link?.instagram;
    this.facebook = link?.facebook;
    this.telegram = link?.telegram;
  }

  static parse(raw: any) {
    const links = new SocialLinks(raw);
    return links;
  }

  toJson() {
    return {
      linkId: this.linkId || null,
      youtube: this.youtube || null,
      twitter: this.twitter || null,
      tiktok: this.tiktok || null,
      instagram: this.instagram || null,
      facebook: this.facebook || null,
      telegram: this.telegram || null,
    };
  }
}

export class GeneralLinks {
  linkId?: string;
  userId?: string;
  title?: string;
  links?: GeneralLink[];

  constructor(link: { id?: string; userId?: string; title?: string; links?: GeneralLink[] }) {
    this.linkId = link?.id;
    this.userId = link?.userId;
    this.title = link?.title;
    this.links = link?.links;
  }

  static parse(raw: any) {
    const general = new GeneralLinks(raw);
    general.links = general.links?.map((link) => GeneralLink.parse(link));
    return general;
  }

  toJson() {
    return {
      linkId: this.linkId || null,
      title: this.title || null,
      links: this.links || [],
    };
  }
}

export class GeneralLink {
  link?: string;
  description?: string;
  viewCount?: number;

  constructor(content: { link?: string; description?: string; viewCount?: number }) {
    this.link = content?.link;
    this.description = content?.description;
    this.viewCount = content?.viewCount;
  }

  static parse(raw: any) {
    return new GeneralLink(raw);
  }
}
