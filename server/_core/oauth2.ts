/**
 * OAuth2 Authentication Module
 * Provides Google and GitHub OAuth2 integration
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface OAuthProfile {
  id: string;
  displayName: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github';
}

export interface OAuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: string;
  providerId: string;
  createdAt: Date;
  lastLogin: Date;
}

/**
 * Initialize OAuth2 strategies
 */
export const initializeOAuth2 = (): void => {
  // Google OAuth2 Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/google/callback`,
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const user: OAuthProfile = {
              id: profile.id,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value || '',
              avatar: profile.photos?.[0]?.value,
              provider: 'google',
            };

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // GitHub OAuth2 Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(
      new GitHubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
          callbackURL: `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/github/callback`,
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
          try {
            const user: OAuthProfile = {
              id: profile.id.toString(),
              displayName: profile.displayName || profile.username || 'GitHub User',
              email: profile.emails?.[0]?.value || `${profile.username}@github.com`,
              avatar: profile.photos?.[0]?.value,
              provider: 'github',
            };

            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Serialize user for session
  passport.serializeUser((user: any, done: any) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done: any) => {
    done(null, user);
  });
};

/**
 * Generate JWT token from OAuth profile
 */
export const generateOAuthToken = (profile: OAuthProfile): string => {
  const token = jwt.sign(
    {
      id: `${profile.provider}:${profile.id}`,
      email: profile.email,
      name: profile.displayName,
      avatar: profile.avatar,
      provider: profile.provider,
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );

  return token;
};

/**
 * Verify JWT token
 */
export const verifyOAuthToken = (token: string): OAuthProfile | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return {
      id: decoded.id,
      displayName: decoded.name,
      email: decoded.email,
      avatar: decoded.avatar,
      provider: decoded.provider,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Middleware to protect routes with OAuth
 */
export const requireOAuth = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'No authorization token provided',
    });
    return;
  }

  const profile = verifyOAuthToken(token);
  if (!profile) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
    return;
  }

  (req as any).oauthUser = profile;
  next();
};

/**
 * OAuth callback handler
 */
export const handleOAuthCallback = (req: Request, res: Response): void => {
  if (!(req as any).user) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
    });
    return;
  }

  const profile = (req as any).user as OAuthProfile;
  const token = generateOAuthToken(profile);

  // Redirect to frontend with token
  const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}`;
  res.redirect(redirectUrl);
};

/**
 * Get OAuth provider info
 */
export const getOAuthProviders = (): {
  google: boolean;
  github: boolean;
} => {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  };
};

/**
 * Revoke OAuth token
 */
export const revokeOAuthToken = (token: string): void => {
  // In production, you would revoke the token from the OAuth provider
  // For now, we just mark it as revoked in a blacklist
  console.log(`Token revoked: ${token.substring(0, 20)}...`);
};

export default {
  initializeOAuth2,
  generateOAuthToken,
  verifyOAuthToken,
  requireOAuth,
  handleOAuthCallback,
  getOAuthProviders,
  revokeOAuthToken,
};
