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
		getSpendings(userID: ID!): [Spending]
		getSpending(spendingId: ID!): Spending!
		getSpendingsByRange(
			userID: ID!
			budgetID: ID!
			input: rangeInput!
		): [Spending]
	}

	input rangeInput {
		startDate: String!
		endDate: String!
	}

	input spendingInput {
		name: String!
		date: String!
		spended: Int!
		toBudget: ID!
	}

	type Mutation {
		createSpending(input: spendingInput!): Spending!
		deleteSpending(spendingID: ID!, budgetID: ID!): String!
	}
`;
