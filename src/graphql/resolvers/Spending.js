import Budget from '../../models/Budget';
import Spending from '../../models/Spending';
import checkAuth from '../../utils/checkAuth';
import dayjs from 'dayjs';
import {
	AuthenticationError,
	UserInputError,
} from 'apollo-server-core';

export default {
	Query: {
		async getSpendings(_, {}, context) {
			const user = checkAuth(context);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to find Spendings.'
				);
			}

			try {
				const spendings = await Spending.find({
					creator: user.id,
				});

				if (spendings.length < 1) {
					throw new Error(
						`Can't find Spending records with your User, be sure you've previously created Spending records.`
					);
				} else {
					return spendings;
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async getSpending(_, { spendingId }, context) {
			const user = checkAuth(context);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to find Spendings.'
				);
			}

			try {
				const spending = await Spending.findOne({
					$and: [{ _id: spendingId }, { creator: user.id }],
				});
				if (!spending) {
					throw new Error('Spending not found!');
				} else {
					return spending;
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async getSpendingsByBudget(_, { budgetId }, context) {
			const user = checkAuth(context);
			const budget = await Budget.findOne(
				{
					$or: [
						{ $and: [{ _id: budgetId }, { owner: user.id }] },
						{ $and: [{ _id: budgetId }, { collab: user.id }] },
					],
				},
				{},
				{ autopopulate: false }
			);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to search Spendings.'
				);
			} else if (!budget) {
				throw new UserInputError(
					`Can't find the required Budget, be sure you are selecting an existing one.`
				);
			}

			try {
				const spendings = await Spending.find({
					$and: [{ toBudget: budgetId }, { creator: user.id }],
				});

				if (spendings.length < 1) {
					throw new UserInputError(
						`Can't find the required Spending redords, be sure you're selecting a Budget with an existing Spendings.`
					);
				} else {
					return spendings;
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async getSpendingsByRange(
			_,
			{ budgetId, input: { startDate, endDate } },
			context
		) {
			const user = checkAuth(context);
			const budget = await Budget.findOne(
				{
					$or: [
						{ $and: [{ _id: budgetId }, { owner: user.id }] },
						{ $and: [{ _id: budgetId }, { collab: user.id }] },
					],
				},
				{},
				{ autopopulate: false }
			);

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to search Spendings.'
				);
			} else if (!budget) {
				throw new UserInputError(
					`Can't find the required Budget, be sure you are selecting an existing one.`
				);
			}

			try {
				const start = dayjs(startDate)
					.startOf('day')
					.format('YYYY-MM-DD HH:mm');
				const end = dayjs(endDate)
					.endOf('day')
					.format('YYYY-MM-DD HH:mm');

				const spendings = await Spending.find({
					$and: [
						{ date: { $gte: start, $lte: end } },
						{ toBudget: budgetId },
						{ creator: user.id },
					],
				}).sort({
					date: 1,
				});

				if (spendings.length < 1) {
					throw new Error(
						`Can't find Spendings on this date range, be sure you're providing a valid date range with Spending records between it.`
					);
				} else {
					return spendings;
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
	Mutation: {
		async createSpending(_, { input }, context) {
			const user = checkAuth(context);
			const { name, description, date, spended, toBudget } = input;
			const budget = await Budget.findOne(
				{
					$or: [
						{ $and: [{ _id: toBudget }, { owner: user.id }] },
						{ $and: [{ _id: toBudget }, { collab: user.id }] },
					],
				},
				{},
				{ autopopulate: false }
			);
			const remaining = budget ? budget.quantity - budget.spended : 0;
			const totalSpended = budget ? budget.spended + spended : 0;

			if (!user) {
				throw new AuthenticationError(
					'Action not allowed, you must be logged on or have a valid token to create a new Spending.'
				);
			} else if (!budget) {
				throw new UserInputError(
					`Can't find the required Budget, be sure you are selecting an existing one.`
				);
			} else if (spended > remaining) {
				throw new UserInputError(
					`Can't create the required Spending record, because the spended quantity exceeds the selected Budget available remaining quantity of €${remaining}`
					///FIXME: Show the currency symbol from the budget model instead of plain text.
				);
			} else if (spended <= 0) {
				throw new UserInputError(
					`Can't create the required Spending record, because the spended quantity it's invalid.`
				);
			}

			try {
				const newSpending = new Spending({
					name,
					description,
					date: dayjs(date).format('YYYY-MM-DD'),
					toBudget,
					spended,
					creator: user.id,
					createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
				});

				const spending = await newSpending.save();

				await Budget.findOneAndUpdate(
					{ _id: budget.id },
					{
						spended: totalSpended,
						updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
					},
					{ new: true }
				);

				return spending;
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
