const AWS = require('aws-sdk')
const axios = require('axios')
const express = require('express')
const Crypto = require("crypto")
const app = express.Router()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID

const TableName = {
  User: process.env.USER_TABLE,
  Visit: process.env.VISIT_TABLE,
  Token: process.env.TOKEN_TABLE
}

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
    console.error(response.data.error)
    throw new Error(response.data.error)
  }
  return response.data
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

const putToken = async (data) => {
  const params = {
    TableName: TableName.Token,
    Item: {
      token: data.token,
      userId: data.userId,
      expiredAt: data.expiredAt,
      updatedAt: data.updatedAt
    }
  };
  return await dynamodb.put(params).promise();
}

const getTokenInfo = async (token) => {
  const params = {
    TableName: TableName.Token,
    Key: { token }
  }
  const res = await dynamodb.get(params).promise()
  return res.Item
}

app.put('/v1/user', async function(req, res) {
  try {
    const { accessToken } = req.body
    const now = new Date().getTime()
    // LINEのアクセストークンが正しいか検証
    await verifyToken(accessToken)
    // アクセストークンを利用してプロフィール取得
    const profile = await getProfile(accessToken)
    await putUser({
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl || '',
      updatedAt: now,
    })
    res.json({success: 'succeed!', url: req.url, data: {} });
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});
/************************************
 * HTTP post method for insert object *
 *************************************/

app.post('/v1/qrCode', async function(req, res) {
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

app.get('/v1/visit', async function(req, res) {
  try {
    const data = await getVisitList();
    res.json({success: 'succeed!', url: req.url, data: data});
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

app.post('/v2/token', async function(req, res) {
  try {
    const { accessToken } = req.body
    const now = new Date().getTime()
    // LINEのアクセストークンが正しいか検証
    await verifyToken(accessToken)
    // アクセストークンを利用してプロフィール取得
    const profile = await getProfile(accessToken)
    const userId = profile.userId

    // ランダムな文字列を生成
    const token  = Crypto.randomBytes(16).toString("hex")
    await putToken({
      token,
      userId,
      expiredAt: now + 20 * 1000, // 20秒だけ有効
      updatedAt: now,
    })
    res.json({success: 'succeed!', url: req.url, data: { token }})
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});

app.post('/v2/qrCode', async function(req, res) {
  try {
    console.log('/v2/qrCode')
    const { qrCode } = req.body
    const token = qrCode
    const visitedAt = new Date().getTime()
    const tokenInfo = await getTokenInfo(token)
    if (!tokenInfo) {
      res.statusCode = 401;
      return res.json({error: 'Token is not found.', url: req.url, body: req.body});
    } else if (visitedAt > tokenInfo.expiredAt) {
      res.statusCode = 401;
      return res.json({error: 'Token is expired.', url: req.url, body: req.body});
    }
    const userId = tokenInfo.userId
    const user = await getUser(userId)
    await putVisit( {
      userId,
      visitedAt: visitedAt,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
    });
    res.json({success: 'succeed!', url: req.url, data: {}});
  } catch (err) {
    console.error(err)
    res.statusCode = 500;
    res.json({error: err, url: req.url, body: req.body});
  }
});
module.exports = app
