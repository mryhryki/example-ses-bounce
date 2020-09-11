const {DynamoDB} = require('aws-sdk')

const client = new DynamoDB.DocumentClient({apiVersion: '2012-10-08', region: 'us-east-1'})
const TableName = process.env.DYBAMODB_TABLE_NAME

const getData = (address) => {
  const params = {
    TableName,
    Key: {
      address,
    }
  }
  return client.get(params).promise()
}

const putData = (address, data) => {
  const params = {
    TableName,
    Item: {
      ...data,
      address,
    }
  }
  return client.put(params).promise()
}

module.exports = {
  getData,
  putData,
}
