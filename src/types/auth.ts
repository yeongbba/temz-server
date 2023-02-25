declare module 'auth' {
  export type User = {
    nickname: string;
    profile: Profile;
    email: string;
    domain: string;
    phone: string;
    wallet?: string;
    password?: string;
  };

  type Profile = {
    title: string;
    description?: string;
    image?: string;
    background?: string;
  };
}
