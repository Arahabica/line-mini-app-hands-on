---
title: "システム構成"
---

## 3.1 システム構成図

![System](https://storage.googleapis.com/zenn-user-upload/ar0nc5xupl3rrep14lylqy734map)

今回のアプリのシステム構成図は上図のようになります。
S3にNuxt.jsのSPAを配置し、LambdaにAPIサーバを配置し、データはDynamoDBに保存しています。
また、フロントのエンドポイントはCloudFrontにまとめて、URLのパスに応じてS3とAPI Gatewayにアクセスを振り分けています。
AWS Systems Managerパラメータストアには設定情報を格納しています。

この構成をServerless Frameworkを用いて一括でデプロイします。


## 3.2 早速デプロイ
早速ですが、デプロイしてしまいましょう（デプロイに時間がかかるので）

まず、他の人とバッティングしないようにサービス名を編集します。
プロジェクトのルートにある`serverless.yml`の最初の行の`your-name`をバッティングしないような適当な名前に修正してください。
TwitterやGitHubのユーザ名とかでいいと思います。

```diff yml:~/environment/line-mini-app-hands-on/serverless.yml
- service: your-name-line-member-card
+ service: {{YOUR NAME}}-line-member-card
```

次に、デプロイに必要なパッケージをインストールします。
```sh:~/environment/line-mini-app-hands-on
$ yarn install
```

そして、`yarn deploy`でデプロイが始まります。
```sh:~/environment/line-mini-app-hands-on
$ yarn deploy
```

## 3.3 Serverless Frameworkによるシステム構成について
![Serverless Framework HP](https://storage.googleapis.com/zenn-user-upload/0q3lmv5raq46hk0w9rypts68k1cr)



Serverless Frameworkでは`serverless.yml`というファイルにシステム構成の定義をまとめて、`sls deploy`というコマンドを叩くとシステムを構築してくれます。
インフラに関しては基本1つのファイルだけ見れば良いので、管理が楽になります。
いわゆるIaC(Infrastructure as Code)ですね。

具体的に`serverless.yml`の中身を見ていきましょう

#### 3.3.1 API Gateway + AWS Lambda

下記の記述で、API GatewayとAWS Lambdaが構築されます。

```yml:~/environment/line-mini-app-hands-on/serverless.yml[57-66]
functions:
  backend:
    handler: backend/lambda.handler
    events:
      - http:
          path: /
          method: ANY
      - http:
          path: '{proxy+}'
          method: ANY
```
これにより、APIにアクセスすると`backend/lambda.js`の`handler`メソッドされます。
パスはなんでも受け付けるようにしてあり、パスの処理はLambdaの中で行っています。

#### 3.3.2 S3

下記の記述で、S3が構築されます。

```yml:~/environment/line-mini-app-hands-on/serverless.yml[17-19]
  s3Sync:
    - bucketName: ${self:custom.app.PUBLIC_BUCKET}
      localDir: frontend/dist/
```

```yml:~/environment/line-mini-app-hands-on/serverless.yml[69-74]
    S3Storage:
      Type: 'AWS::S3::Bucket'
      Properties:
        AccessControl: PublicRead
        BucketName: '${self:custom.app.PUBLIC_BUCKET}'
        WebsiteConfiguration:
          IndexDocument: index.html
```
`frontend`ディレクトリ内にNuxt.jsのソースコードが配置されているので、これをビルドしたものをS3に配置する形になります。

#### 3.3.3 CloudFront
下記の記述で、CloudFrontが構築されます。

```yml:~/environment/line-mini-app-hands-on/serverless.yml[90-150]
    StaticContentsCloudFront:
      Type: AWS::CloudFront::Distribution
      Properties:
        DistributionConfig:
          Enabled: true
          Comment: "Delivery static contents"
          PriceClass: PriceClass_200
          DefaultRootObject: index.html
          Origins:
            - Id: ApiOrigin
              DomainName:
                Fn::Join: ["", [{"Ref": "ApiGatewayRestApi"},".execute-api.${self:custom.region}.amazonaws.com"]]
              OriginPath: "/${self:custom.stage}"
              CustomOriginConfig:
                OriginProtocolPolicy: match-viewer
            - Id: S3Origin
              DomainName: ${self:custom.app.S3_WEB_DOMAIN}
              CustomOriginConfig:
                OriginProtocolPolicy: match-viewer
          DefaultCacheBehavior:
            AllowedMethods:
              - HEAD
              - GET
            CachedMethods:
              - HEAD
              - GET
            Compress: true
            DefaultTTL: 0
            MaxTTL: 0
            MinTTL: 0
            ForwardedValues:
              QueryString: true
            SmoothStreaming: false
            TargetOriginId: S3Origin
            ViewerProtocolPolicy: https-only
          CacheBehaviors:
            - TargetOriginId: ApiOrigin
              PathPattern: "/api/*"
              AllowedMethods:
                - HEAD
                - GET
                - POST
                - PUT
                - DELETE
                - OPTIONS
                - PATCH
              CachedMethods:
                - HEAD
                - GET
              Compress: true
              DefaultTTL: 0
              MaxTTL: 0
              MinTTL: 0
              ForwardedValues:
                QueryString: true
              ViewerProtocolPolicy: https-only
          CustomErrorResponses:
            - ErrorCachingMinTTL: 0
              ErrorCode: 404
              ResponseCode: 200
              ResponsePagePath: /
```

`Properties.DistributionConfig.Origins`に`ApiOrigin`と`S3Origin`があるのが確認できると思います。
`Properties.DistributionConfig.CacheBehaviors[0].PathPattern` に `/api/*`が設定されていますが、これにより、`/api/*`に一致するURLはAPI Gatewayに回すようになっています。
`Properties.DistributionConfig.CustomErrorResponses`で404ステータスになった場合`/`のコンテンツを返すようにしていますが、これによりSPAで`/`以外のURLにアクセスした時も問題なく動作するようになっています。

#### 3.3.4 DynamoDB
下記の記述で、DynamoDBが構築されます。

```yml:~/environment/line-mini-app-hands-on/serverless.yml[157-199]
    UserTable:
      Type: 'AWS::DynamoDB::Table'
      Properties:
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:custom.app.USER_TABLE}
    VisitTable:
      Type: 'AWS::DynamoDB::Table'
      Properties:
        AttributeDefinitions:
          - AttributeName: userId
            AttributeType: S
          - AttributeName: visitedAt
            AttributeType: N
        KeySchema:
          - AttributeName: userId
            KeyType: HASH
          - AttributeName: visitedAt
            KeyType: RANGE
        ProvisionedThroughput:
          ReadCapacityUnits: 1
          WriteCapacityUnits: 1
        TableName: ${self:custom.app.VISIT_TABLE}
```
今回使うテーブルはUserテーブルとVisitテーブルの2つです。

## 3.4 Webページ確認

デプロイの出力に`StaticContentsCloudFrontUrl`という項目があるので、そのURLにアクセスしてみてください。
`https://***********.cloudfront.net`のようなURLになっているはずです。
```sh:~/environment/line-mini-app-hands-on
Stack Outputs
StaticContentsCloudFrontUrl: https://***********.cloudfront.net
ArahabicaDashlineDashmemberDashcardDashdevDashnodejsDashdefaultLambdaLayerQualifiedArn: arn:aws:lambda:ap-northeast-1:************:layer:******-line-member-card-dev-nodejs-default:1
BackendLambdaFunctionQualifiedArn: arn:aws:lambda:ap-northeast-1:***********:function:********-line-member-card-dev-backend:1
ServiceEndpoint: https://***********.execute-api.ap-northeast-1.amazonaws.com/dev
ServerlessDeploymentBucketName: ********-line-member-card-dev-deployment

S3 Sync: Syncing directories and S3 prefixes...
......
S3 Sync: Synced.
S3 Sync: Syncing metadata...
.
S3 Sync: Synced metadata.
S3 Sync: Updating bucket tags...
.
S3 Sync: Updated bucket tags.
Done in 378.09s.
ec2-user:~/environment/line-
```

下図のようなページが表示されれば成功です。
![Nuxt default](https://storage.googleapis.com/zenn-user-upload/dqm055305czd9hm5ryw63ifec8pt)


:::details 504 Error時の対処法
まれに504 Errorが表示されることがあります。
その時はまず、CloudFrontの`Origins and Origin Groups`から`Origin Path`に適当な文字を入れて保存し、しばらくしてURLにアクセスして404エラーになることを確認します。
その後、もう一度、`Origin Path`を空欄にして保存し、しばらくすると正常に動作するようになります。
:::

