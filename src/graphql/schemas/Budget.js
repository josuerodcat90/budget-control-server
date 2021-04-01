import { gql } from 'apollo-server-express';

export default gql`
	type Budget {
		id: ID!
		name: String!
		quantity: Int!
		owner: ID!
		collab: [ID]
		createdAt: String!
		updatedAt: String
	}

	type Query {
		getBudget(id: ID!): Budget!
		getBudgets(ownerId: ID!, collabId: ID): [Budget]
	}

	input budgetInput {
		name: String!
		quantity: Int!
	}

	type Mutation {
		createBudget(input: budgetInput!): Budget!
		updateBudget(budgetId: ID!, input: budgetInput!): Budget!
		addCollaborator(budgetId: ID!, collab: ID!): String!
		deleteBudget(budgetId: ID!): String!
	}
`;
