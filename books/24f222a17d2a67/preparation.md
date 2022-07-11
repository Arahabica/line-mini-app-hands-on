---
title: "事前準備"
---
## 2.1 Cloud9環境のセットアップ
Cloud9 とはAWS上に構築できるクラウドIDE(統合開発環境)になります。
ブラウザ上でコーディングからデバッグ、デプロイまで行うことができます。
今回はこのCloud9を使って、アプリを構築していきます。

#### 2.1.1 AWSコンソールにログイン

https://console.aws.amazon.com/

#### 2.1.2 Cloud9の画面に移動
* 検索フォームに`Cloud9`と入れると見つけることができます。
  ![Cloud9 TOP](https://storage.googleapis.com/zenn-user-upload/i3fk1vaz027jmro09uvvkm8iybo0)

#### 2.1.3 Cloud9の環境を構築
* Nameに適当な環境名を入れてください。
* 他のパラメータはデフォルトのままでOKです。
  ![Cloud9 Setting](https://storage.googleapis.com/zenn-user-upload/zncb747qif31wjvj0b7ddjeacllm)


#### 2.1.4 Cloud9の環境の完成🎉
![Cloud9 Start](https://storage.googleapis.com/zenn-user-upload/3yz1mrkyvg6t0bqjkphxw92cxnkp)


## 2.2 GitHub clone

元となるソースコードをGitHubからクローンします
```sh:~/environment
$ git clone https://github.com/Arahabica/line-mini-app-hands-on
$ cd line-mini-app-hands-on/
```
## 2.3 Node.jsをv16にアップデート

Node.jsのメモリエラーが出ないように、最大メモリ容量も上げます。
```sh:~/environment/line-mini-app-hands-on
$ nvm install v16.16.0
$ nvm alias default v16.16.0
$ export NODE_OPTIONS="--max-old-space-size=1024"
```


## 2.4 yarnをインストール

Node.jsのパッケージマネージャの`yarn`をインストールします
```sh:~/environment/line-member-card-hands-on
 $ npm install --global yarn
 ```


## 2.5 serverless frameworkをインストール
Serverless Frameworkとはサーバレスなアプリケーションを構成管理デプロイするためのツールです。

```sh:~/environment/line-member-card-hands-on
 $ npm install --global serverless@3.20
 ```
 