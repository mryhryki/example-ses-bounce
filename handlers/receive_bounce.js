'use strict';

const {putData} = require('./common/dynamodb')

module.exports.handler = async (event) => {
  await Promise.all(event.Records.map(async (record) => {
    const {notificationType, mail} = JSON.parse(record.Sns.Message);

    // 通知種別がバウンス以外は無視
    if (notificationType !== 'Bounce') {
      return
    }

    // バウンスしたアドレスをDynamoDBに保存
    const {destination: bounceAddresses} = mail
    await Promise.all(bounceAddresses.map(address => putData(address, {bounce: true})))
  }))
};
