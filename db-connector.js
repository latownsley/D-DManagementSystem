
const mysql = require('mysql');

// Create a connection to the database
const db = mysql.createConnection({
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_gauspohj',
    password        : 'airfilter',
    database        : 'cs340_gauspohj'
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit the process if the connection fails
    } else {
        console.log('Connected to the database.');
    }
});

// Export the database connection
module.exports = db;

// JUST A TEST QUERY, DELETE LATER
db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
        console.error('Test query failed:', err);
    } else {
        console.log('Test query result:', results[0].result);
    }
});

module.exports = db;