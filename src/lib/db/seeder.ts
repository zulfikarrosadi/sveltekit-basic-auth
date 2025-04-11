import 'dotenv/config';
import connection from './index';
import { usersTable } from './schema';

// this is for testing purpose only
const ADNIN_SEEDER_PASSWORD = 'admin';

async function main() {
	const newUser: typeof usersTable.$inferInsert = {
		email: 'admin@example.com',
		fullName: 'Admin',
		password: ADNIN_SEEDER_PASSWORD
	};

	try {
		await connection.insert(usersTable).values(newUser);
		const user = await connection.select().from(usersTable);
		console.log('created new user: ', user);
	} catch (error) {
		console.log('something went wrong: ', error);
	}
}

main();
