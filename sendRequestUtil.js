const _dbRequestPromise = (connection, query, values) => {
    return (resolve, reject) => {
        connection.query(query, values, (err, result) => {
            if (err) {
                console.log("Error while executing the query ", err);
                reject("Error while executing the query ");
            } else {
                resolve(result);
            }

            connection.close();
        })
    }
}

const sendRequest = (connection, query, values) => {
    return new Promise(_dbRequestPromise(connection, query, values));
}

module.exports.sendRequest = sendRequest;