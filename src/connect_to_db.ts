import { pool } from "./config/db.config.js";

export function logSampleData() { 
    pool.query('SELECT * FROM users', (err, res) => {
        if (err) {
            console.error('Error executing query', err);
        } else {
            console.log('Sample data:', res.rows);
        }
    });
}
