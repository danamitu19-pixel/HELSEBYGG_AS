const argon2 = require('argon2');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
    const conn = await mysql.createConnection({
        host: process.env.AUTH_DB_HOST,
        user: process.env.AUTH_DB_USER,
        password: process.env.AUTH_DB_PASSWORD,
        database: process.env.AUTH_DB_NAME
    });

    const users = [
        { username: 'kari',   password: 'Kari1234!'  },
        { username: 'ola',    password: 'Ola12345!'  },
        { username: 'ingrid', password: 'Ingrid123!' },
    ];

    for (const u of users) {
        const hash = await argon2.hash(u.password);
        await conn.execute(
            'UPDATE user_account SET password_hash = ? WHERE username = ?',
            [hash, u.username]
        );
        console.log('Updated:', u.username);
    }

    await conn.end();
    console.log('Done!');
}
main();
