import Budget from '../../models/Budget';
import User from '../../models/User';
import dayjs from 'dayjs';
import checkAuth from '../../utils/checkAuth';
import { AuthenticationError, UserInputError } from 'apollo-server-core';

export default {
	Query: {
		async getBudgets(_, {}, context) {
			const user = checkAuth(context);
			if (user) {
				const budgets = await Budget.find({
					$or: [{ owner: user.id }, { collab: user.id }],
				});

				return budgets;
			} else {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to find Budgets.'
				);
			}
		},
	},
	Mutation: {
		async createBudget(_, { input }, context) {
			const user = checkAuth(context);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to create a Budget.'
				);
			} else {
				const newBudget = new Budget({
					...input,
					owner: user.id,
					createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
				});

				const budget = await newBudget.save();

				return budget;
			}
		},
		async updateBudget(_, { budgetId, input }, context) {
			const owner = checkAuth(context);
			const budget = await Budget.findOne(
				{ _id: budgetId },
				{},
				{ autopopulate: false }
			);

			try {
				if (owner.id == budget.owner) {
					const updatedBudget = await Budget.findOneAndUpdate(
						{ _id: budgetId },
						{
							...input,
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
						},
						{ new: true }
					);
					return updatedBudget;
				} else {
					throw new AuthenticationError(
						'Action not allowed, to update you must be the owner of this Budget.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async addCollaborator(_, { budgetId, collabEmail }, context) {
			const owner = checkAuth(context);
			const budget = await Budget.findOne(
				{ _id: budgetId },
				{},
				{ autopopulate: false }
			);

			try {
				const collab = await User.findOne(
					{ email: collabEmail },
					{},
					{ autopopulate: false }
				);

				if (!collab) {
					throw new UserInputError(
						`Can't find the collaborator, be sure you're writing right the collaborator's email.`
					);
				}

				if (owner.id == budget.owner) {
					const collabBudget = await Budget.findOneAndUpdate(
						{ _id: budgetId },
						{
							collab: collab.id,
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
						},
						{ new: true }
					);
					return collabBudget;
				} else {
					throw new AuthenticationError(
						'Action not allowed, to add a collaborator you must be the owner of this Budget.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async removeCollaborator(_, { budgetId, collabEmail }, context) {
			const owner = checkAuth(context);
			const budget = await Budget.findOne(
				{ _id: budgetId },
				{},
				{ autopopulate: false }
			);
 
			try {
				const collab = await User.findOne(
					{ email: collabEmail },
					{},
					{ autopopulate: false }
				);

				if (!collab) {
					throw new UserInputError(
						`Can't find the collaborator, be sure you're writing right the collaborator's email.`
					);
				}

				if (budget.collab != collab.id) {
					throw new UserInputError(
						`The input email didn't match with the Budget's collaborator, be sure you're writing right the collaborator's email.`
					);
				}

				if (owner.id == budget.owner) {
					const collabBudget = await Budget.findOneAndUpdate(
						{ _id: budgetId },
						{
							collab: null,
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
						},
						{ new: true }
					);
					return collabBudget;
				} else {
					throw new AuthenticationError(
						'Action not allowed, to add a collaborator you must be the owner of this Budget.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async deleteBudget(_, { budgetId }, context) {
			const user = checkAuth(context);

			try {
				const budget = await Budget.findOne(
					{ _id: budgetId },
					{},
					{ autopopulate: false }
				);

				if (!budget) {
					throw new UserInputError(
						`Can't find the Budget, be sure the Budget was not deleted before.`
					);
				}

				if (user.id == budget.owner) {
					await budget.delete();
					return 'Budget deleted succesfully.';
				} else {
					throw new AuthenticationError(
						'Action not allowed, you must be the owner of this Budget to delete it.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
