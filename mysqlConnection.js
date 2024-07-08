const {createConnection} = require('mysql2');

const SELECT_USER_QUERY_BY_ID_PASSWORD = "SELECT * FROM fruitvegetables.user where username=? AND password=?";
const SELECT_FRUITS_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = "fruit"`;
const SELECT_VEGETABLES_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = "vegetable"`;
const SELECT_FRUIT_BY_ID = `SELECT * FROM fruitvegetables.product where category = "fruit" AND id = ?`;
const SEARCH_PRODUCT_BY_NAME = `SELECT * FROM fruitvegetables.product where name LIKE ?`;
const SEARCH_USER_BY_EMAIL = `SELECT * FROM fruitvegetables.user where email = ?`;
const SELECT_ADDRESSES_FOR_USER = `SELECT * FROM fruitvegetables.address where email = ?`;
const INSERT_USER = `INSERT INTO fruitvegetables.user (username, email, phone_number) VALUES (?, ?, ?)`;
const SELECT_USER = `SELECT * FROM fruitvegetables.user where email = ?`;
const SELECT_ORDER = `SELECT * FROM fruitvegetables.order where email_id = ?`;
const INSERT_ADDRESS = 'INSERT INTO fruitvegetables.address (house_flat_no, street_locality, pincode, type, name, phone_number, address_line_2, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
const INSERT_ORDER = 'INSERT INTO fruitvegetables.order (email_id, order_date, status, total_price) VALUES (?, ?, "placed", ?)';
const INSERT_ORDER_ITEM = 'INSERT INTO fruitvegetables.order_item (order_id, product_id, quantity, unit_price) VALUES ?';


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

const searchProduct = async(searchText) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SEARCH_PRODUCT_BY_NAME, [searchText], (err, result) => {
            if (err) {
                console.log("Getting error while searching for product with the name: " + searchText);
                reject(err);
            }

            console.log(result)
            if (result.length > 0) {
                console.log("Found products matching with: " + searchText);
                console.log(result);
                resolve(result);
            }

            connection.close();
        })
    })
}

const getAddresses = async(emailId) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_ADDRESSES_FOR_USER, [emailId], (err, addresses) => {
            if (err) {
                console.log("Getting error while searching for address with the email: " + emailId);
                reject(err);
            } else if (addresses.length > 0) {
                resolve(addresses);
            } else {
                reject("Did not find any address associated to the user");
            }

            connection.close();
        });
    })
}

const insertUser = async (email, name, phoneNumber) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(INSERT_USER, [name, email, phoneNumber], (err, result) => {
            if (err) {
                console.log("Getting error while searching for user with the email: " + email);
                reject(err);
            } else {
                console.log("User Inserted");
                resolve(result);
            }

            connection.close();
        });
    });
}

const getUser = async (email) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_USER, [email], (err, result) => {
            if (err) {
                console.log("Getting error while searching for user with the email: " + email);
                reject(err);
            } else {
                console.log("User Found");
                resolve(result);
            }

            connection.close();
        });
    });
}

const submitAddress = async ({houseFlatNo, area, pincode, name, phoneNo, email}) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(INSERT_ADDRESS, [houseFlatNo, area, pincode, "home", name, phoneNo, "", email], (err, result) => {
            if (err) {
                console.log("Getting error while inserting address " + err);
                reject(err);
            } else {
                console.log("Insertion successfull");
                resolve(result);
            }

            connection.close();
        });
    });
}

const submitOrder = async ({email, items, totalPrice, date}) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(INSERT_ORDER, [email, date, totalPrice], (err, result) => {
            if (err) {
                console.log("Getting error while inserting order " + err);
                reject(err);
            } else {
                console.log("Insertion successful ", result.insertId);
                let a  = items.map(item => {
                    return [result.insertId, item.productId, item.quantity, item.unitPrice];
                });
                connection.query(INSERT_ORDER_ITEM, [a], (errA, resultA) => {
                    if (errA) {
                        reject(errA);
                    } else {
                        resolve({orderId: result.insertId});
                    }
                });
                
            }

            connection.close();
        });
    });
}

const ordersList = async (email) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_ORDER, [email], (err, result) => {
            if (err) {
                console.log("Getting error while searching for order with the email: " + email);
                reject(err);
            } else {
                resolve(result);
            }

            connection.close();
        });
    });
};

module.exports.validateUserLogin = validateUserLogin;
module.exports.getFruits = getFruits;
module.exports.getFruit = getFruit;
module.exports.getVegetables = getVegetables;
module.exports.searchProduct = searchProduct;
module.exports.getAddresses = getAddresses;
module.exports.insertUser = insertUser;
module.exports.getUser = getUser;
module.exports.submitAddress = submitAddress;
module.exports.submitOrder = submitOrder;
module.exports.ordersList = ordersList;