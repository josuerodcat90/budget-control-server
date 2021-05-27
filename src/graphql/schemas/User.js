import { gql } from 'apollo-server-express';

export default gql`
	type User {
		id: ID!
		name: String!
		email: String!
		token: String!
		createdAt: String!
		updatedAt: String
	}

	type Query {
		getUser(userId: ID!): User!
		getUsers: [User]
	}

	input userInput {
		name: String!
		email: String!
		password: String!
		confirmPassword: String!
	}

	input shortUserInput {
		name: String!
		email: String!
	}

	type Mutation {
		createUser(input: userInput!): User!
		login(email: String!, password: String!): User!
		updateUser(userId: ID!, input: shortUserInput!): User!
		deleteUser(userId: ID!): String!
	}
`;
