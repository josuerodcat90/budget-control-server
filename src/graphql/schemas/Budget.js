import { gql } from 'apollo-server-express';

export default gql`
	type Budget {
		id: ID!
		name: String!
		quantity: Float!
		spended: Float!
		currency: String!
		owner: User!
		collab: User
		status: String!
		createdAt: String!
		updatedAt: String
	}

	type Query {
		getBudget(budgetId: ID!): Budget!
		getBudgets: [Budget]!
	}

	input budgetInput {
		name: String!
		quantity: Float!
		currency: String!
	}

	input editBudgetInput {
		name: String!
		quantity: Float!
		currency: String!
		status: String!
	}

	type Mutation {
		createBudget(input: budgetInput!): Budget!
		updateBudget(budgetId: ID!, input: editBudgetInput!): Budget!
		addCollaborator(budgetId: ID!, collabEmail: String!): Budget!
		removeCollaborator(budgetId: ID!, collabEmail: String!): Budget!
		deleteBudget(budgetId: ID!): String!
		returnLeftover(fromId: ID!): String!
	}
`;
