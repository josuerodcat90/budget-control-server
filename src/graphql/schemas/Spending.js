import { gql } from 'apollo-server-express';

export default gql`
	type Spending {
		id: ID!
		name: String!
		date: String!
		spended: Int!
		toBudget: Budget!
		creator: User!
	}

	type Query {
		getHello: String!
	}
`;
