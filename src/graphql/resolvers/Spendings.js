// import checkAuth from '../../utils/checkAuth';
// import moment from 'moment';
// import { AuthenticationError } from 'apollo-server-core';

export default {
	Query: {
		getHello() {
			const message = 'Hello World';
			return message;
		},
	},
};
