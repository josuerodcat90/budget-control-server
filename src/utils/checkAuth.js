import { AuthenticationError } from 'apollo-server-express';
import jwt from 'jsonwebtoken';

export default (context) => {
	const authHeader = context.req.headers.authorization;
	if (authHeader) {
		const token = authHeader.split('Bearer ')[1];
		if (token) {
			try {
				const user = jwt.verify(token, process.env.SECRET_KEY);
				return user;
			} catch (err) {
				throw new AuthenticationError('Invalid/Expired token');
			}
		} else {
			throw new Error("Authentication token must be 'Bearer [token]'");
		}
	} else {
		throw new Error('Authorization header must be provided');
	}
};
