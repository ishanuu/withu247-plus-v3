/**
 * GraphQL API Setup
 * Provides GraphQL endpoint alongside REST API
 */

import { ApolloServer } from '@apollo/server';
import gql from 'graphql-tag';
// @ts-ignore
import { expressMiddleware } from '@apollo/server/express4';
import { Request, Response } from 'express';

/**
 * GraphQL Type Definitions
 */
export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    role: String!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    searchUsers(query: String!): [User!]!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, name: String!): AuthPayload!
    updateProfile(name: String, avatar: String): User!
    logout: Boolean!
  }

  type Subscription {
    userUpdated: User!
  }
`;

/**
 * GraphQL Resolvers
 */
export const resolvers = {
  Query: {
    me: async (parent: any, args: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },

    user: async (parent: any, args: { id: string }, context: any) => {
      // In production, fetch from database
      return {
        id: args.id,
        email: 'user@example.com',
        name: 'User Name',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },

    users: async (parent: any, args: { limit?: number; offset?: number }, context: any) => {
      const limit = Math.min(args.limit || 20, 100);
      const offset = args.offset || 0;

      // In production, fetch from database with pagination
      return [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    },

    searchUsers: async (parent: any, args: { query: string }, context: any) => {
      // In production, search in database
      return [];
    },
  },

  Mutation: {
    login: async (parent: any, args: { email: string; password: string }, context: any) => {
      // In production, validate credentials and generate token
      const token = 'jwt-token-here';
      const user = {
        id: '1',
        email: args.email,
        name: 'User Name',
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { token, user };
    },

    register: async (
      parent: any,
      args: { email: string; password: string; name: string },
      context: any
    ) => {
      // In production, create user and generate token
      const token = 'jwt-token-here';
      const user = {
        id: '1',
        email: args.email,
        name: args.name,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { token, user };
    },

    updateProfile: async (
      parent: any,
      args: { name?: string; avatar?: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // In production, update in database
      return {
        ...context.user,
        name: args.name || context.user.name,
        avatar: args.avatar || context.user.avatar,
        updatedAt: new Date().toISOString(),
      };
    },

    logout: async (parent: any, args: any, context: any) => {
      // In production, invalidate token
      return true;
    },
  },
};

/**
 * Create Apollo Server instance
 */
export const createApolloServer = async (): Promise<ApolloServer> => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  return server;
};

/**
 * GraphQL middleware factory
 */
export const createGraphQLMiddleware = (server: ApolloServer) => {
  return expressMiddleware(server, {
    context: async ({ req, res }: { req: Request; res: Response }) => {
      // Extract user from request
      const token = req.headers.authorization?.split(' ')[1];
      let user = null;

      if (token) {
        // In production, verify token and get user
        user = {
          id: '1',
          email: 'user@example.com',
          name: 'User Name',
          role: 'user',
        };
      }

      return { user, req, res };
    },
  });
};

/**
 * GraphQL error handler
 */
export const handleGraphQLError = (error: any): void => {
  console.error('GraphQL Error:', {
    message: error.message,
    locations: error.locations,
    path: error.path,
  });
};

/**
 * GraphQL performance monitoring
 */
export const createGraphQLMonitoring = () => {
  return {
    didResolveOperation: (context: any) => {
      context.startTime = Date.now();
    },

    didEncounterErrors: (context: any) => {
      for (const err of context.errors) {
        console.error('GraphQL Error:', err.message);
      }
    },

    willSendResponse: (context: any) => {
      const duration = Date.now() - (context.startTime || 0);
      console.log(`GraphQL Operation: ${context.operationName} - ${duration}ms`);
    },
  };
};

export default {
  typeDefs,
  resolvers,
  createApolloServer,
  createGraphQLMiddleware,
  handleGraphQLError,
  createGraphQLMonitoring,
};
