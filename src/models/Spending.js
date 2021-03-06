import { Schema, model } from 'mongoose';

const spendingSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
	},
	date: {
		type: String,
		required: true,
	},
	spended: {
		type: Number,
		required: true,
	},
	toBudget: {
		type: Schema.Types.ObjectId,
		ref: 'Budget',
		autopopulate: true,
	},
	creator: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		autopopulate: true,
	},
	createdAt: String,
	updatedAt: String,
});

spendingSchema.set('toJSON', {
	virtuals: true,
	versionKey: false,
	transform: function (doc, ret) {
		delete ret._id;
	},
});

spendingSchema.plugin(require('mongoose-autopopulate'));

export default model('Spending', spendingSchema);
