export class Links {
  linkId?: string;
  userId?: string;
  youtube?: string;
  twitter?: string;
  tiktok?: string;
  instagram?: string;
  facebook?: string;
  telegram?: string;
  general?: GeneralLinks[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(link: {
    id?: string;
    userId?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    telegram?: string;
    general?: GeneralLinks[];
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.linkId = link?.id;
    this.userId = link?.userId;
    this.youtube = link?.youtube;
    this.twitter = link?.twitter;
    this.tiktok = link?.tiktok;
    this.instagram = link?.instagram;
    this.facebook = link?.facebook;
    this.telegram = link?.telegram;
    this.general = link?.general;
    this.createdAt = link?.createdAt;
    this.updatedAt = link?.updatedAt;
  }

  static parse(raw: any) {
    const links = new Links(raw);
    links.general = links.general?.map((theme) => GeneralLinks.parse(theme));
    return links;
  }

  toJson() {
    return {
      youtube: this.youtube || null,
      twitter: this.twitter || null,
      tiktok: this.tiktok || null,
      instagram: this.instagram || null,
      facebook: this.facebook || null,
      telegram: this.telegram || null,
      general: this.general || [],
    };
  }
}

export class GeneralLinks {
  title?: string;
  links?: GeneralLink[];

  constructor(link: { title?: string; links?: GeneralLink[] }) {
    this.title = link?.title;
    this.links = link?.links;
  }

  static parse(raw: any) {
    const general = new GeneralLinks(raw);
    general.links = general.links.map((link) => GeneralLink.parse(link));
    return general;
  }
}

export class GeneralLink {
  link?: string;
  description?: string;

  constructor(content: { link?: string; description?: string }) {
    this.link = content?.link;
    this.description = content?.description;
  }

  static parse(raw: any) {
    return new GeneralLink(raw);
  }
}
