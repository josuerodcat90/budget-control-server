import Budget from '../../models/Budget';
import User from '../../models/User';
import Spending from '../../models/Spending';
import dayjs from 'dayjs';
import checkAuth from '../../utils/checkAuth';
import { AuthenticationError, UserInputError } from 'apollo-server-core';

export default {
	Query: {
		async getBudgets(_, {}, context) {
			const user = checkAuth(context);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to find Budgets.'
				);
			}

			try {
				const budgets = await Budget.find({
					$or: [{ owner: user.id }, { collab: user.id }],
				});

				if (budgets.length < 1) {
					throw new UserInputError(
						`Can't find any Budgets, be sure you've created one or more before search.`
					);
				}

				return budgets;
			} catch (err) {
				throw new Error(err);
			}
		},
		async getBudget(_, { budgetId }, context) {
			const user = checkAuth(context);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to find Budgets.'
				);
			}

			try {
				const budget = await Budget.findOne({
					$or: [
						{ $and: [{ _id: budgetId }, { owner: user.id }] },
						{ $and: [{ _id: budgetId }, { collab: user.id }] },
					],
				});

				if (!budget) {
					throw new UserInputError(
						`Can't find any Budget, be sure you're searching a existing or non-deleted one.`
					);
				}

				return budget;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		async createBudget(_, { input }, context) {
			const user = checkAuth(context);
			const general = await Budget.findOne(
				{ $and: [{ name: 'General' }, { owner: user.id }] },
				{},
				{ autopopulate: false }
			);
			const existingbudget = await Budget.findOne(
				{
					$and: [
						{
							name: {
								$regex: new RegExp('^' + input.name.toLowerCase() + '$', 'i'),
							},
						},
						{ owner: user.id },
					],
				},
				{},
				{ autopopulate: false }
			);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to create a Budget.'
				);
			} else if (!general) {
				throw new UserInputError(
					`Can't find the 'General' Budget, be sure you're searching a existing or non-deleted one.`
				);
			} else if (existingbudget) {
				throw new UserInputError(
					`Can't create ${input.name} Budget, because you can't create another one with the same name.`
				);
			}

			try {
				const remaining = general.quantity - general.spended;

				if (input.name.toLowerCase() === 'general') {
					throw new UserInputError(
						`Can't create 'General' Budget, because it's already created by default, and you can't create another one with the same name.`
					);
				} else if (input.quantity <= remaining) {
					const newBudget = new Budget({
						...input,
						currency: general.currency,
						owner: user.id,
						createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					const newBudgetSpending = new Spending({
						name: `Created ${input.name} Budget.`,
						description: `New Budget created from General.`,
						date: dayjs().format('YYYY-MM-DD'),
						toBudget: general.id,
						spended: input.quantity,
						creator: user.id,
						createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					await general.update({
						spended: general.spended + input.quantity,
						updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					await newBudgetSpending.save();

					const budget = await newBudget.save();

					return budget;
				} else {
					throw new UserInputError(
						`The required quantity of the new Budget exceeds the remaining quantity of 'General' Budget.`
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async updateBudget(_, { budgetId, input }, context) {
			const owner = checkAuth(context);
			const general = await Budget.findOne(
				{ $and: [{ name: 'General' }, { owner: user.id }] },
				{},
				{ autopopulate: false }
			);
			const budget = await Budget.findOne(
				{ _id: budgetId },
				{},
				{ autopopulate: false }
			);
			const remaining = general.quantity - general.spended;
			const lessOrMore = (budget, input) => {
				let res;
				if (input.quantity > budget.quantity) {
					res = 'More';
					return res;
				} else if (input.quantity < budget.quantity) {
					res = 'Less';
					return res;
				} else {
					res = 'Equal';
					return res;
				}
			};

			lessOrMore();

			if (!owner) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to create a Budget.'
				);
			} else if (!budget) {
				throw new UserInputError(
					`Can't find the 'General' Budget, be sure you're searching a existing or non-deleted one.`
				);
			} else if (budget.name.toLowerCase() === 'general') {
				throw new UserInputError(`You can't edit the 'General' Budget.`);
			} else if (remaining < input.quantity) {
				throw new UserInputError(
					`You can't change the Budget's quantity, because 'General' Budget has less funds than the required quantity.`
				);
			}

			try {
				if (owner.id == budget.owner) {
					await budget.update(
						{
							...input,
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
						},
						{ new: true }
					);
					return budget;
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
						'Action not allowed, to remove a collaborator you must be the owner of this Budget.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async deleteBudget(_, { budgetId }, context) {
			const user = checkAuth(context);
			const budget = await Budget.findOne(
				{ _id: budgetId },
				{},
				{ autopopulate: false }
			);
			const spendings = await Spending.find(
				{ toBudget: budgetId },
				{},
				{ autopopulate: false }
			);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to create a Budget.'
				);
			} else if (!budget) {
				throw new UserInputError(
					`Can't find the Budget, be sure the Budget was not deleted before.`
				);
			} else if (budget.name.toLowerCase() === 'general') {
				throw new UserInputError(`You can't delete the 'General' Budget.`);
			} else if (spendings.length >= 1) {
				throw new UserInputError(
					`Can't delete the required budget, because it has Spending records created with it, try to change the status to 'Cancelled' instead, to prevent inconsistent data.`
				);
			}

			try {
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
		async returnLeftover(_, { fromId }, context) {
			const user = checkAuth(context);
			const fromBudget = await Budget.findOne(
				{ _id: fromId },
				{},
				{ autopopulate: false }
			);
			const general = await Budget.findOne(
				{ $and: [{ owner: user.id }, { name: 'General' }] },
				{},
				{ autopopulate: false }
			);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to transfer leftovers to General Budget.'
				);
			} else if (!fromBudget || !general) {
				throw new UserInputError(
					`Can't find one of both Budgets, be sure no one of it was deleted before.`
				);
			}

			try {
				if (fromBudget.status === 'Completed') {
					throw new UserInputError(
						`You can't transfer any leftover because the required budget was completed before and not have any available quantity to return.`
					);
				} else if (user.id == fromBudget.owner && user.id == general.owner) {
					const leftover = fromBudget.quantity - fromBudget.spended;

					const addLeftoverSpending = new Spending({
						name: 'Leftover Return',
						description: `Return of '${fromBudget.currency}.${leftover}' from Budget: '${fromBudget.name}', to Budget: 'General' as Leftover`,
						date: dayjs().format('YYYY-MM-DD'),
						toBudget: fromId,
						spended: leftover,
						creator: user.id,
						createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					await addLeftoverSpending.save();

					await fromBudget.update({
						spended: fromBudget.spended + leftover,
						status: 'Completed',
						updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					await general.update({
						spended: general.spended - leftover,
						updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
					});

					return `The transfer of ${fromBudget.currency}.${leftover} from Budget: '${fromBudget.name}', to Budget: 'General' as Leftover was successful`;
				} else {
					throw new AuthenticationError(
						'Action not allowed, you must be the owner of both Budgets to transfer leftovers to General Budget.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
