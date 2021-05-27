export const validateUserRegisterInput = (
	name,
	email,
	password,
	confirmPassword
) => {
	const errors = {};

	///verify if the fields are empty
	if (name.trim() === '') {
		errors.name = 'Name field must not be empty';
	}

	if (email.trim() === '') {
		errors.email = 'Email field must not be empty';
	} else {
		const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
		if (!email.match(regEx)) {
			errors.email =
				'Email must be a valid email address like "example@example.com"';
		}
	}

	if (password === '') {
		errors.password = 'Password field must not be empty';
	} else if (password !== confirmPassword) {
		errors.confirmPassword = 'Passwords must match';
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};

export const validateLoginInput = (email, password) => {
	const errors = {};
	if (email.trim() === '') {
		errors.email = 'Email field must not be empty';
	}
	if (password === '') {
		errors.password = 'Password field must not be empty';
	}

	return {
		errors,
		valid: Object.keys(errors).length < 1,
	};
};
