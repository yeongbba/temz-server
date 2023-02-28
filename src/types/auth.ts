declare module 'auth' {
  export type User = {
    name: string;
    password?: string;
    profile: Profile;
    email: string;
    phone: string;
    wallet?: string;
  };

  type Profile = {
    title: string;
    description?: string;
    image?: string;
    background?: string;
  };
}
