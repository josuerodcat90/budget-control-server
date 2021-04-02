import { gql } from 'apollo-server-express';

export default gql`
	type Budget {
		id: ID!
		name: String!
		quantity: Int!
		spended: Int!
		owner: User!
		collab: User
		createdAt: String!
		updatedAt: String
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
		updateBudget(budgetId: ID!, input: budgetInput!): Budget!
		addCollaborator(budgetId: ID!, collabEmail: String!): Budget!
		removeCollaborator(budgetId: ID!, collabEmail: String!): Budget!
		deleteBudget(budgetId: ID!): String!
	}
`;
