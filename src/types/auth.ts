export class User {
  userId?: string;
  name?: string;
  password?: string;
  profile?: Profile;
  email?: string;
  phone?: string | null;
  wallet?: string;
  isDormant?: boolean;
  lastLogin?: Date;
  lastResetPassword?: Date;
  failLoginCount?: number;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(user: {
    id?: string;
    name?: string;
    password?: string;
    profile?: Profile;
    email?: string;
    phone?: string;
    wallet?: string;
    isDormant?: boolean;
    lastLogin?: Date;
    lastResetPassword?: Date;
    failLoginCount?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    this.userId = user?.id;
    this.name = user?.name;
    this.password = user?.password;
    this.profile = user?.profile;
    this.email = user?.email;
    this.phone = user?.phone;
    this.wallet = user?.wallet;
    this.isDormant = user?.isDormant;
    this.lastLogin = user?.lastLogin;
    this.lastResetPassword = user?.lastResetPassword;
    this.failLoginCount = user?.failLoginCount;
    this.createdAt = user?.createdAt;
    this.updatedAt = user?.updatedAt;
  }

  static parse(raw: any) {
    const user = new User(raw);
    user.profile = Profile.parse(user.profile);
    return user;
  }

  toJson() {
    return {
      name: this.name,
      profile: this.profile,
      email: this.email || null,
      phone: this.phone,
      wallet: this.wallet || null,
      isDormant: this.isDormant,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export class Profile {
  title?: string;
  description?: string;
  image?: string;
  background?: string;

  constructor(profile: { id?: string; title?: string; description?: string; image?: string; background?: string }) {
    this.title = profile?.title;
    this.description = profile?.description;
    this.image = profile?.image;
    this.background = profile?.background;
  }

  static parse(raw: any) {
    return new Profile(raw);
  }
}
