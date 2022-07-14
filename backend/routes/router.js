const AWS = require('aws-sdk')
const axios = require('axios')
const express = require('express')
const app = express.Router()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID

const TableName = {
  User: process.env.USER_TABLE,
  Visit: process.env.VISIT_TABLE
}

const dynamodb = new AWS.DynamoDB.DocumentClient();

const axiosInstance = axios.create({
  baseURL: 'https://api.line.me',
  responseType: 'json'
})

// 渡されたLINE IDトークンが正しいものかを検証
const verifyToken = async (userId, idToken) => {
  const params = new URLSearchParams()
  params.append('id_token', idToken)
  params.append('user_id', userId)
  params.append('client_id', LINE_CHANNEL_ID)
  const response = await axiosInstance.post('/oauth2/v2.1/verify', params)
  if (response.status !== 200) {
    console.error(response.data.error_description)
    throw new Error(response.data.error)
  }
  //アクセストークンの有効期限
  if (response.data.exp * 1000 < new Date().getTime()) {
    throw new Error('access token is expired.')
  }
  return {
    userId: response.data.sub,
    displayName: response.data.name || '', // 権限によっては取得できない
    pictureUrl: response.data.picture || '' // 権限によっては取得できない
  }
}

const getUser = async (userId) => {
  const params = {
    TableName: TableName.User,
    Key: { id: userId }
  }
  const res = await dynamodb.get(params).promise()
  return res.Item
}

const putUser = async (data) => {
  const params = {
    TableName: TableName.User,
    Item: {
      id: data.userId,
      displayName: data.displayName,
      pictureUrl: data.pictureUrl,
      updatedAt: data.updatedAt
    }
  };
  return await dynamodb.put(params).promise();
}

const putVisit = async (data) => {
  let params = {
    TableName: TableName.Visit,
    Item: {
      userId: data.userId,
      visitedAt: data.visitedAt,
      displayName: data.displayName,
      pictureUrl: data.pictureUrl,
    }
  };
  return dynamodb.put(params).promise();
}

const getVisitList = async () => {
  const params = {
    TableName: TableName.Visit,
  };
  const data = await dynamodb.scan(params).promise()
  return data.Items;
}

app.put('/user', async function(req, res) {
  try {
    const { userId, idToken } = req.body
    const now = new Date().getTime()
    // LINEのIDストークンが正しいか検証
    const profile = await verifyToken(userId, idToken)
    await putUser({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      updatedAt: now,
    })
    res.json({success: 'succeed!', url: req.url, data: {}});
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});
/************************************
 * HTTP post method for insert object *
 *************************************/

app.post('/qrCode', async function(req, res) {
  try {
    const { qrCode } = req.body
    const userId = qrCode
    const visitedAt = new Date().getTime()
    const user = await getUser(userId)
    const data = await putVisit( {
      userId: user.id,
      visitedAt: visitedAt,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
    });
    res.json({success: 'succeed!', url: req.url, data: data});
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

app.get('/visit', async function(req, res) {
  try {
    const data = await getVisitList();
    res.json({success: 'succeed!', url: req.url, data: data});
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

module.exports = app
