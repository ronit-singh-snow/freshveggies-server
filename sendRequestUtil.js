const _dbRequestPromise = (connection, query, values, closeConnection) => {
    return (resolve, reject) => {
        connection.query(query, values, (err, result) => {
            if (err) {
                console.log("Error while executing the query ", err);
                reject("Error while executing the query ");
            } else {
                resolve(result);
            }

            if (closeConnection)
                connection.close();
        })
    }
}

const sendRequest = (connection, query, values, closeConnection = true) => {
    return new Promise(_dbRequestPromise(connection, query, values, closeConnection));
}

module.exports.sendRequest = sendRequest;