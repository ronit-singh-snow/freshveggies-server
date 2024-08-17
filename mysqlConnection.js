const {createConnection, createPool} = require('mysql2');
const { sendRequest } = require('./sendRequestUtil');
const { query } = require('express');

const SELECT_USER_QUERY_BY_ID_PASSWORD = "SELECT * FROM fruitvegetables.user where username=? AND password=?";
const SELECT_FRUITS_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = 'fruit'`;
const SELECT_VEGETABLES_QUERY_WITHOUT_LIMIT = `SELECT * FROM fruitvegetables.product where category = 'vegetable'`;
const SELECT_FRUIT_BY_ID = `SELECT * FROM fruitvegetables.product where category = "fruit" AND id = ?`;
const SEARCH_PRODUCT_BASE_QUERY = `SELECT * FROM fruitvegetables.product`;
const SEARCH_PRODUCT_BY_NAME = `SELECT * FROM fruitvegetables.product where name LIKE ?`;
const SEARCH_USER_BY_EMAIL = `SELECT * FROM fruitvegetables.user where email = ?`;
const SELECT_ADDRESSES_FOR_USER = `SELECT * FROM fruitvegetables.address where phone_number = ?`;
const SELECT_ADDRESSES_FOR_USER_BY_ID = `SELECT * FROM fruitvegetables.address where idaddress = ?`;
const INSERT_USER = `INSERT INTO fruitvegetables.user (username, email, phone_number) VALUES (?, ?, ?)`;
const SELECT_USER = `SELECT * FROM fruitvegetables.user where email = ? or phone_number = ?`;
const SELECT_ORDER = `SELECT * FROM fruitvegetables.order where phone_number = ?`;
const INSERT_ADDRESS = 'INSERT INTO fruitvegetables.address (house_flat_no, street_locality, pincode, type, name, phone_number, address_line_2, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
const INSERT_ORDER = 'INSERT INTO fruitvegetables.order (email_id, order_date, status, total_price) VALUES (?, ?, "placed", ?)';
const INSERT_ORDER_ITEM = 'INSERT INTO fruitvegetables.order_item (order_id, product_id, quantity, unit_price) VALUES ?';


const mysqlConnectionConfig = {
    host: "freshveggies-mysqldb-freshveggies-backend.i.aivencloud.com",
    user: "avnadmin",
    password: "AVNS_6_cmqvEvy0ur5xFMSgT",
    database: "fruitvegetables",
    port: 20009
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

const getHomepageDetails = async () => {
    let homepageData = {};
    let fruits = await filterProductWithQuery("fruit", null, null, 3);
    homepageData.downSections = [];
    homepageData.downSections.push({
        title: "Seasonal fruits",
        data: fruits,
        query: {
            category: 'fruit'
        }
    });

    let vegetables = await filterProductWithQuery("vegetable", null, null, 3);
    homepageData.downSections.push({
        title: "Seasonal vegetables",
        data: vegetables,
        query: {
            category: 'vegetable'
        }
    });

    homepageData.banners = [
        {
            imageSource: "/static/images/banner_image_1.jpg",
            query: {
               category: "fruit" 
            },
            title: "Mixed fruits"
        },
        {
            imageSource: "/static/images/banner_image_2.jpg",
            query: {
               category: "vegetable" 
            },
            title: "Mixed vegetables"
        },
    ];

    return homepageData;
}

const filterProductWithQuery = async (category, subcategory, extraQueryCondition, limit) => {
    let connection = createConnection(mysqlConnectionConfig);
    let whereClause = "";
    let values = [];
    if (category) {
        whereClause += " AND category = ? ";
        values.push(category)
    }
        
    if (subcategory) {
        whereClause += " AND sub_category = ? ";
        values.push(subcategory);
    }

    if (extraQueryCondition && extraQueryCondition.length > 0) {
        let accValue = extraQueryCondition.reduce((acc, queryMap, index) => {
            if (queryMap.value)
                acc =+ ` AND ${queryMap.column} ${queryMap.operator} ${queryMap.value}`;

            return acc;
        }, "");
        console.log(accValue);
    }
   
    let query = SEARCH_PRODUCT_BASE_QUERY +  (whereClause ? " WHERE " + whereClause.substring(5) : "");
        
    if (limit)
        query += " LIMIT " + limit;

    return sendRequest(connection, query, values);
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

const getAddresses = async(phoneNumber) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_ADDRESSES_FOR_USER, [phoneNumber], (err, addresses) => {
            if (err) {
                console.log("Getting error while searching for address with the phone number: " + phoneNumber);
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

const getAddressById = async (id) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_ADDRESSES_FOR_USER_BY_ID, [id], (err, addresses) => {
            if (err) {
                console.log("Getting error while searching for address with the id: " + id);
                reject(err);
            } else if (addresses.length > 0) {
                console.log("Added found");
                resolve(addresses);
            } else {
                console.log("Did not find any address associated to the user");
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

const getUser = async (id) => {
    let connection = createConnection(mysqlConnectionConfig);
    console.log(id);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_USER, [id, id], (err, result) => {
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

const submitAddress = async ({locality, area, pincode, username, phone_number, email, type}) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(INSERT_ADDRESS, [locality, area, pincode, type, username, phone_number, "", email], (err, result) => {
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

const ordersList = async (phoneNumber) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        connection.query(SELECT_ORDER, [phoneNumber], (err, result) => {
            if (err) {
                console.log("Getting error while searching for order with the phoneNumber: " + phoneNumber);
                reject(err);
            } else {
                resolve(result);
            }

            connection.close();
        });
    });
};

module.exports.validateUserLogin = validateUserLogin;
module.exports.getFruit = getFruit;
module.exports.searchProduct = searchProduct;
module.exports.getAddresses = getAddresses;
module.exports.getAddressById = getAddressById;
module.exports.insertUser = insertUser;
module.exports.getUser = getUser;
module.exports.submitAddress = submitAddress;
module.exports.submitOrder = submitOrder;
module.exports.ordersList = ordersList;
module.exports.filterProductWithQuery = filterProductWithQuery;
module.exports.getHomepageDetails = getHomepageDetails;