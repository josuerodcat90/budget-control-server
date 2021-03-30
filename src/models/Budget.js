import { Schema, model } from 'mongoose';

const budgetSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	quantity: {
		type: Number,
		required: true,
		default: 0,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		autopopulate: true,
	},
	collab: [
		{
			type: Schema.Types.ObjectId,
			ref: 'User',
			autopopulate: true,
		},
	],
	createdAt: String,
	updatedAt: String,
});

budgetSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
	},
});

budgetSchema.plugin(require('mongoose-autopopulate'));

export default model('Budget', budgetSchema);
