import '@babel/polyfill';
import 'dotenv/config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import path from 'path';

const typeDefs = mergeTypes(
	fileLoader(path.join(__dirname, '/graphql/schemas'))
);
const resolvers = mergeResolvers(
	fileLoader(path.join(__dirname, '/graphql/resolvers'))
);

const app = express();

app.set('PORT', process.env.PORT || 4000);

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ req }),
});

server.applyMiddleware({ app });

export default app;
