const serverlessExpress = require('@vendia/serverless-express')
const app = require('./app')

const server = serverlessExpress.createServer(app)

exports.handler = serverlessExpress({ app })
