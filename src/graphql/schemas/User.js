import { gql } from 'apollo-server-express';

export default gql`
	type User {
		id: ID!
		name: String!
		email: String!
	}

	type Query {
		getUser(id: ID!): User!
		getUsers: [User]
	}

	input userInput {
		name: String!
		email: String!
		password: String!
		confirmPassword: String!
	}

	type Mutation {
		createUser(input: userInput!): User!
		updateUser(input: userInput!): User!
		deleteUser(id: ID!): String!
	}
`;
