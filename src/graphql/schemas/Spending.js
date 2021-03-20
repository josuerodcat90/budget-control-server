import { gql } from 'apollo-server-express';

export default gql`
	type Spending {
		id: ID!
		name: String!
		date: String!
		spended: Int!
		toBudget: Budget!
		creator: User!
		createdAt: String!
		updatedAt: String!
	}

	type Query {
		getHello: String!
	}

	input spendingInput {
		name: String!
		date: String!
		spended: Int!
		toBudget: ID!
		creator: ID!
	}

	type Mutation {
		createSpending(input: spendingInput!): Spending!
	}
`;
