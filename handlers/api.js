'use strict';
const {SES} = require('aws-sdk')
const ses = new SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1',
})

module.exports.handler = async (event) => {
  try {
    const {to, subject, body} = JSON.parse(event.body)

    const params = {
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Charset: "UTF-8",
          Data: subject
        },
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: body
          }
        }
      },
      Source: process.env.SES_SENDER_ADDRESS
    }
    console.info('Send Email:', JSON.stringify(params))
    await ses.sendEmail(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({message: 'Success'}, null, 2)
    };
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({message: 'Error'}, null, 2),
    };
  }
};
