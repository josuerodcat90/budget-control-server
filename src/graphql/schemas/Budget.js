import { gql } from 'apollo-server-express';

export default gql`
	type Budget {
		id: ID!
		name: String!
		quantity: Int!
		createdAt: String!
		updatedAt: String!
	}

	type Query {
		getBudget(id: ID!): Budget!
		getBudgets: [Budget]
	}

	input budgetInput {
		name: String!
		quantity: Int!
	}

	type Mutation {
		createBudget(input: budgetInput!): Budget!
		updateBudget(input: budgetInput!): Budget!
		deleteBudget(id: ID!): String!
	}
`;
