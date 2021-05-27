import mongoose from 'mongoose';

export const connectDB = async () => {
	const URI =
		process.env.MONGODB_URI || 'mongodb://localhost:27017/budgetcontrol';

	try {
		await mongoose.connect(URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		});
		console.log(`>>>Cloud DB is connected!<<<`);
	} catch (e) {
		console.error(`¡Something goes wrong!`);
		console.error(e);
	}
};
