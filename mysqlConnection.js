const {createConnection} = require('mysql2');

const SELECT_USER_QUERY_BY_ID_PASSWORD = "SELECT * FROM fruitvegetables.user where username=? AND password=?";
const SELECT_FRUITS_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = "fruit"`;
const SELECT_VEGETABLES_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = "vegetable"`;
const SELECT_FRUIT_BY_ID = `SELECT * FROM fruitvegetables.product where category = "fruit" AND id = ?`;
const mysqlConnectionConfig = {
    host: "localhost",
    user: "root",
    password: "root",
    database: "fruitvegetables"
};


const validateUserLogin = async (userId, password) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_USER_QUERY_BY_ID_PASSWORD, [userId, password], (err, result, field) => {
            if (err) {
                console.log("Error while fetching users");
                reject(err);
            }
            if (result.length > 0) {
                console.log("Found matching user with the provided userId and password");
                resolve(true);
            }
            else {
                console.log("Did not find any user with the provided credentials");
                resolve(false);
            } 
            connection.close();
            resolve(false);
        })
    })
    
};

const getFruits = async(limit) => {
    let connection = createConnection(mysqlConnectionConfig);
    let query = SELECT_FRUITS_QUERY_WITHOUT_LIMIT;
    if (limit)
        query += ` LIMIT ${limit}`;

    return new Promise((resolve, reject) => {
        connection.query(query, (err, result) => {
            if (err) {
                console.log("Getting error while fetching the fruits");
                reject(err);
            }

            if (result.length > 0) {
                console.log("Found fruits");
                console.log(result);
                resolve(result);
            }

            connection.close();
        })
    })
}

const getVegetables = async(limit) => {
    let connection = createConnection(mysqlConnectionConfig);
    let query = SELECT_VEGETABLES_QUERY_WITHOUT_LIMIT;
    if (limit)
        limit += ` LIMIT ${limit}`;
    
    return new Promise((resolve, reject) => {
        connection.query(SELECT_VEGETABLES_QUERY_WITHOUT_LIMIT, (err, result) => {
            if (err) {
                console.log("Getting error while fetching the vegetables");
                reject(err);
            }

            if (result.length > 0) {
                console.log("Found vegetables");
                console.log(result);
                resolve(result);
            }

            connection.close();
        })
    })
}

const getFruit = async(fruitId) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_FRUIT_BY_ID, [fruitId], (err, result) => {
            if (err) {
                console.log("Getting error while fetching the fruit with ID: " + fruitId);
                reject(err);
            }

            if (result.length > 0) {
                console.log("Found fruit for ID: " + fruitId);
                console.log(result);
                resolve(result);
            }

            connection.close();
        })
    })
}

module.exports.validateUserLogin = validateUserLogin;
module.exports.getFruits = getFruits;
module.exports.getFruit = getFruit;
module.exports.getVegetables = getVegetables;