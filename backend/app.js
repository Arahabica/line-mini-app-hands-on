const AWS = require('aws-sdk')
const axios = require('axios')
const bodyParser = require('body-parser')
const express = require('express')


const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID
// AWS.config.update({ region: process.env.TABLE_REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableSuffix = ''
if(process.env.ENV && process.env.ENV !== "NONE") {
  tableSuffix = '-' + process.env.ENV;
}
const TableName = {
  User: 'LineMemberUser' + tableSuffix,
  Visit: 'LineMemberVisit' + tableSuffix,
}

// declare a new express app
var app = express()
app.use(bodyParser.json())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  res.header("Access-Control-Allow-Credentials", "true")
  next()
});

const axiosInstance = axios.create({
  baseURL: 'https://api.line.me',
  responseType: 'json'
})

// 渡されたLINEトークンが正しいものかを検証
const verifyToken = async accessToken => {
  const response = await axiosInstance.get('/oauth2/v2.1/verify', { params: { access_token: accessToken }} )
  if (response.status !== 200) {
    console.error(response.data.error_description)
    throw new Error(response.data.error)
  }
  // チャネルIDをチェック
  if (response.data.client_id !== LINE_CHANNEL_ID) {
    throw new Error('client_id does not match.')
  }
  //アクセストークンの有効期限
  if (response.data.expires_in < 0) {
    throw new Error('access token is expired.')
  }
}

const getProfile = async (accessToken) => {
  const response = await axiosInstance.get('/v2/profile', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    data: {}
  })
  if (response.status !== 200) {
    console.error(response.data.error_description)
    throw new Error(response.data.error)
  }
  return response.data
}

const getUser = (userId) => {
  const params = {
    TableName: TableName.User,
    Key: {
      'userId': {S: userId}
    }
  }
  return dynamodb.getItem(params).promise()
}

const putUser = async (data) => {
  const params = {
    TableName: TableName.User,
    Item: {
      userId: {S: data.userId},
      displayName: {S: data.displayName },
      pictureUrl: {S: data.pictureUrl },
      updatedAt: {N: data.updatedAt }
    }
  };
  return await dynamodb.put(params).promise();
}

const putVisit = async (data) => {
  let params = {
    TableName: TableName.Visit,
    Item: {
      userId: {S: data.userId},
      visitedAt: {N: data.visitedAt},
      displayName: {S: data.displayName},
      pictureUrl: {S: data.pictureUrl},
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

app.put('/v1/user', async function(req, res) {
  try {
    const {accessToken} = req.body
    const now = new Date().getTime()
    // LINEのアクセストークンが正しいか検証
    await verifyToken(accessToken)
    // アクセストークンを利用してプロフィール取得
    const profile = await getProfile(accessToken)
    const data = await putUser({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.userId || '',
      updatedAt: now,
    })
    console.log(data);
    res.json({success: 'succeed!', url: req.url, data });
  } catch (err) {
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});
/************************************
 * HTTP post method for insert object *
 *************************************/

app.post('/v1/visit', async function(req, res) {
  try {
    const userId = req.body.userId
    const visitedAt = new Date().getTime()
    const user = await getUser(userId)
    const data = await putVisit( {
      userId: user.userId,
      visitedAt: visitedAt,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
    });
    console.log(data);
    res.json({success: 'succeed!', url: req.url, data: data});
  } catch (err) {
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

app.get('/v1/visit', async function(req, res) {
  try {
    const data = await getVisitList();
    console.log(data);
    res.json({success: 'succeed!', url: req.url, data: data});
  } catch (err) {
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

module.exports = app
