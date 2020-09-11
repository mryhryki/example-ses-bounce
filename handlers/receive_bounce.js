'use strict';
const {putData} = require('./common/dynamodb')

module.exports.handler = async (event) => {
  await Promise.all(event.Records.map(async (record) => {
    const {notificationType, mail} = JSON.parse(record.Sns.Message);

    if (notificationType !== 'Bounce') {
      return
    }

    const {destination: bounceAddresses} = mail
    await Promise.all(bounceAddresses.map(address => putData(address, {bounce: true})))
  }))
};
