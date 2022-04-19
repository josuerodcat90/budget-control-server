import { UserInputError } from 'apollo-server-express';
import { AuthenticationError } from 'apollo-server-core';
import User from '../../models/User';
import dayjs from 'dayjs';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
	validateUserRegisterInput,
	validateLoginInput,
} from '../../utils/validation';
import checkAuth from '../../utils/checkAuth';

function generateToken(user) {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			name: user.name,
		},
		process.env.SECRET_KEY,
		{ expiresIn: '72h' } ///FIXME: return the expire time to 1h
	);
}

export default {
	Query: {
		async getUsers() {
			return await User.find();
		},
		async getUser(_, { userId }) {
			return await User.findById(userId);
		},
	},
	Mutation: {
		async login(_, { email, password }) {
			const { errors, valid } = validateLoginInput(email, password);

			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const user = await User.findOne({ email });

			if (!user) {
				errors.general = 'User not found';
				throw new UserInputError('User not found', { errors });
			}

			const match = await bcryptjs.compare(password, user.password);

			if (!match) {
				errors.general = 'Wrong credentials';
				throw new UserInputError('Wrong credentials', { errors });
			}

			const token = generateToken(user);

			return {
				...user._doc,
				id: user.id,
				token,
			};
		},
		async createUser(
			_,
			{ input: { name, email, password, confirmPassword } }
		) {
			const { valid, errors } = validateUserRegisterInput(
				name,
				email,
				password,
				confirmPassword
			);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const emailVal = await User.findOne({ email });

			if (emailVal) {
				throw new UserInputError('Email address in use', {
					errors: {
						email: 'This email is in use with other account',
					},
				});
			} else {
				password = await bcryptjs.hash(password, 12);
			}

			const newUser = new User({
				name,
				email,
				password,
				createdAt: dayjs().format('YYYY-MM-DD HH:mm'),
			});

			const res = await newUser.save();

			const token = generateToken(res);

			return {
				...res._doc,
				id: res.id,
				token,
			};
		},
		async updateUser(_, { userId, input }, context) {
			const user = checkAuth(context);
			const dbUser = await User.findOne({ _id: userId });

			try {
				if (user.id == dbUser._id) {
					const res = await User.findOneAndUpdate(
						{ _id: userId },
						{
							...input,
							updatedAt: dayjs().format('YYYY-MM-DD HH:mm'),
						},
						{ new: true }
					);

					const token = generateToken(res);

					return {
						...res._doc,
						id: res.id,
						token,
					};
				} else {
					throw new AuthenticationError(
						'Action not allowed, you must be the owner of this account to update it.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
		async deleteUser(_, { userId }, context) {
			const user = checkAuth(context);
			const dbUser = await User.findOne({ _id: userId });

			try {
				if (user.id == dbUser._id) {
					await dbUser.delete();
					return 'User deleted succesfully';
				} else {
					throw new AuthenticationError(
						'Action not allowed, you must be the owner of this account to delete it.'
					);
				}
			} catch (err) {
				throw new Error(err);
			}
		},
	},
};
