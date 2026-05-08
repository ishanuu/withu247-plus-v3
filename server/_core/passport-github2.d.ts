declare module 'passport-github2' {
  import { Strategy as PassportStrategy } from 'passport';

  interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
  }

  interface Profile {
    id: string;
    displayName: string;
    username: string;
    profileUrl: string;
    emails: Array<{ value: string; primary?: boolean }>;
    photos: Array<{ value: string }>;
    provider: string;
  }

  class Strategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (accessToken: string, refreshToken: string, profile: Profile, done: (err: any, user?: any) => void) => void
    );
    name: string;
    authenticate(req: any, options?: any): void;
  }

  export = Strategy;
}
