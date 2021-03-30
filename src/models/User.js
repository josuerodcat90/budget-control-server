import { Schema, model } from 'mongoose';

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
		trim: true,
	},
	isCollab: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Budget',
			autopopulate: true,
		},
	],
	createdAt: String,
	updatedAt: String,
});

userSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
	},
});

userSchema.plugin(require('mongoose-autopopulate'));

export default model('User', userSchema);
