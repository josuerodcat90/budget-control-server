import { gql } from 'apollo-server-express';

export default gql`
	type Spending {
		id: ID!
		name: String!
		description: String
		date: String!
		spended: Float!
		toBudget: Budget!
		creator: User!
		createdAt: String!
		updatedAt: String
	}

	type Query {
		getSpendings: [Spending]
		getSpending(spendingId: ID!): Spending!
		getSpendingsByRange(budgetId: ID!, input: rangeInput!): [Spending]
	}

	input rangeInput {
		startDate: String!
		endDate: String!
	}

	input spendingInput {
		name: String!
		description: String
		date: String!
		spended: Float!
		toBudget: ID!
	}

	type Mutation {
		createSpending(input: spendingInput!): Spending!
		deleteSpending(spendingID: ID!, budgetID: ID!): String!
	}
`;
