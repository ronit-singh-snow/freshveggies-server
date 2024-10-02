const {createConnection} = require('mysql2');
const { sendRequest } = require('./sendRequestUtil');
require('dotenv').config()

const SELECT_USER_QUERY_BY_ID_PASSWORD = "SELECT * FROM fruitvegetables.user where username=? AND password=?";
const SELECT_FRUIT_BY_ID = `SELECT * FROM fruitvegetables.product where category = "fruit" AND id = ?`;
const SEARCH_PRODUCT_BASE_QUERY = `SELECT * FROM fruitvegetables.product`;
const SEARCH_PRODUCT_BY_NAME = `SELECT * FROM fruitvegetables.product where name LIKE ?`;
const SELECT_ADDRESSES = `SELECT * FROM fruitvegetables.address`;
const INSERT_USER = `INSERT INTO fruitvegetables.user (username, email, phone_number) VALUES (?, ?, ?)`;
const SELECT_USER = `SELECT * FROM fruitvegetables.user where email = ? or phone_number = ?`;
const SELECT_ORDER = `SELECT * FROM fruitvegetables.order where phone_number = ? order by idorder desc`;
const INSERT_ADDRESS = 'INSERT INTO fruitvegetables.address (locality, full_address, type, name, phone_number, is_default) VALUES (?, ?, ?, ?, ?, ?);'
const INSERT_ORDER = 'INSERT INTO fruitvegetables.order (phone_number, order_date, status, total_price, order_create_at, timeslot, address) VALUES (?, ?, ?, ?, ?, ?, ?)';
const INSERT_ORDER_ITEM = 'INSERT INTO fruitvegetables.order_item (order_id, product_id, quantity, unit_price) VALUES ?';
const SELECT_ORDER_ITEM_PRODUCT = `SELECT * 
                                    FROM order_item
                                    INNER JOIN product where order_item.product_id = product.id AND order_item.order_id = ?;`

const SELECT_ORDER_FILTERED = `select
                                    idorder,
                                    status,
                                    total_price,
                                    from_unixtime(order_date/1000, '%M %d, %Y %H:%i') as 'order_date',
                                    from_unixtime(delivered_at/1000, '%M %d, %Y %H:%i') as 'delivered_at',
                                    timeslot
                                from fruitvegetables.order
                                where
                                    phone_number = ?
                                    AND
                                    (
                                        status = 'placed'
                                        OR (
                                            datediff(NOW(), from_unixtime(order_date/1000, '%Y-%m-%d %H:%i:%s')) < 5
                                            AND
                                            status = 'delivered'
                                        )
                                    )
                                order by order_date desc;`

const mysqlConnectionConfig = {
    host: process.env.AIVEN_HOST,
    user: process.env.AIVEN_USERNAME,
    password: process.env.AIVEN_PASSWORD,
    database: process.env.AIVEN_DATABASE,
    port: process.env.AIVEN_PORT
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

const getAddresses = async(phoneNumber, id) => {
    let connection = createConnection(mysqlConnectionConfig);
    let values = [];
    let whereClause = "";
    
    if (id && id != -1) {
        whereClause += " AND idaddress = ?";
        values.push(id);
    } else if (phoneNumber) {
        whereClause += " AND phone_number = ?";
        values.push(phoneNumber);
    }

    const query = SELECT_ADDRESSES + " WHERE " + whereClause.substring(5);
    return sendRequest(connection, query, values);
}

const insertUser = async (email, name, phoneNumber) => {
    let connection = createConnection(mysqlConnectionConfig);
    return sendRequest(connection, INSERT_USER, [name, email, phoneNumber]);
}

const getUser = async (id) => {
    let connection = createConnection(mysqlConnectionConfig);
    return sendRequest(connection, SELECT_USER, [id, id]);
}

const submitAddress = ({full_address, locality, username, phone_number, email, type, isDefaultAddress, isEdit, idaddress}) => {
    let connection = createConnection(mysqlConnectionConfig);
    let query = "";
    let setValues = [];
    let values = [];
    if (isEdit) {
        if (full_address) {
            setValues.push("full_address = ?");
            values.push(full_address);
        }
        if (locality) {
            setValues.push("locality = ?");
            values.push(locality);
        }
        if (isDefaultAddress) {
            setValues.push("is_default = 1");
        }

        if (values.length > 0) {
            query = "UPDATE fruitvegetables.address SET " + setValues.join(",") + " WHERE (idaddress=?)"
            values.push(idaddress);
        }
    } else {
        values = [locality, full_address, type, username, phone_number, isDefaultAddress];
        query = INSERT_ADDRESS;
    }

    return new Promise((resolve, reject) => {
        if (!query)
            reject("Data is not available");
        
        sendRequest(connection, query, values).then(result => {
            console.log(result);
            resolve(result);
        }).catch(err => {
            reject(err);
        })
    });
}

const deleteRecords = (table, id, columnName) => {
    let query = "DELETE FROM ?? WHERE (?? = ?)";
    let connection = createConnection(mysqlConnectionConfig);
    return sendRequest(connection, query, [table, columnName, parseInt(id)]);
}

const submitOrder = async (orderData, orderItems) => {
    let connection = createConnection(mysqlConnectionConfig);
    return new Promise((resolve, reject) => {
        sendRequest(connection, INSERT_ORDER, [
            orderData.phone_number,
            orderData.order_date,
            orderData.status,
            orderData.total_price,
            orderData.order_create_at,
            orderData.timeslot,
            orderData.address
        ], false).then(result => {
            console.log(result.insertId);
            let values = orderItems.map(item => {
                return [
                    result.insertId,
                    item.item.id,
                    item.quantity,
                    item.item.unitPrice
                ]
            });

            sendRequest(connection, INSERT_ORDER_ITEM, [values], false).then(orderItemResult => {
                resolve({
                    insertedOrderId: result.insertId
                });
                connection.close();
            }).catch(err => {
                reject("Error while inserting the order item");
                connection.close();
            });
            
        }).catch(err => {
            reject("Error while inserting the order");
            connection.close();
        });
    });
}

const ordersList = async (phoneNumber) => {
    let connection = createConnection(mysqlConnectionConfig);
    return sendRequest(connection, SELECT_ORDER_FILTERED, [phoneNumber]);
};

const getOrderItems = async (orderId) => {
    let connection = createConnection(mysqlConnectionConfig);
    return sendRequest(connection, SELECT_ORDER_ITEM_PRODUCT, [(orderId)])
}

module.exports.validateUserLogin = validateUserLogin;
module.exports.getFruit = getFruit;
module.exports.searchProduct = searchProduct;
module.exports.getAddresses = getAddresses;
module.exports.insertUser = insertUser;
module.exports.getUser = getUser;
module.exports.submitAddress = submitAddress;
module.exports.submitOrder = submitOrder;
module.exports.ordersList = ordersList;
module.exports.filterProductWithQuery = filterProductWithQuery;
module.exports.getHomepageDetails = getHomepageDetails;
module.exports.deleteRecords = deleteRecords;
module.exports.getOrderItems = getOrderItems;