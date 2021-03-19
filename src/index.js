import app from './app';
import { connectDB } from './utils/database';

const server = async () => {
	await app.listen(app.get('PORT'));
	console.log(`>>>Server on Port ${app.get('PORT')}!<<<`);
	connectDB();
};

server();

export default server;
