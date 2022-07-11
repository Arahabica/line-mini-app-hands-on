---
title: "LIFFアプリの作成"
---

## 4.1 LIFFアプリ用新規チャネルを作成する
LINE DeveloperページへアクセスしてLINEログインしてください。
    
https://developers.line.biz/ja/
    
プロバイダー設定してない方は「新規プロバイダー作成」をクリックします。
![LINE Provider](https://storage.googleapis.com/zenn-user-upload/azi8p99xha19emtr5zvxqqa3bhfo)

プロバイダー名は基本後から変更できないので本番運用する場合は注意してください。
最初の認証画面などで表示される値になります。
入力できたら「作成」ボタンをクリックします。

![new LINE Channel](https://storage.googleapis.com/zenn-user-upload/iljryedsuymccbrgvi1i2pb8hsqu =360x)

「LINEログイン」をクリックします。

![LINEログイン](https://storage.googleapis.com/zenn-user-upload/83altur8fudfpcpxm61nxk586jns =360x)

次に設定内容を入力していきます。
https://github.com/Arahabica/line-member-card-hands-on/blob/main/resources/icon.png
* チャネルアイコン(任意)
* アプリのアイコン
* こだわりのない人はとりあえず、[こちら](https://github.com/Arahabica/line-member-card-hands-on/blob/main/resources/icon.png)の画像を設定してください。
* チャネル名
* アプリの名前
* チャネル説明
* 説明
* アプリタイプ
* ウェブアプリ
* メールアドレス
* 担当者のメールアドレス

![LINE Setting 001](https://storage.googleapis.com/zenn-user-upload/vvg3u7hykgesdtd9jneykptol4zy)


開発者契約を読んで、チェックして「作成」を押します。
![create LINE Login](https://storage.googleapis.com/zenn-user-upload/ky4eyr6sh37powuyiqc0jovayxvd)

これで、新しいLINEチャネルが作成できました🎉

![new LINE Login Channel](https://storage.googleapis.com/zenn-user-upload/5tzk9cac4ldqql5334i3lfqjusdj)

この時に発行されるチャネルIDは後で使用するのでメモしておいてください。

## 4.2 LIFFアプリの作成

次に`LIFF`タブをクリックして、［追加］ボタンをクリックします。

![LIFF Tab](https://storage.googleapis.com/zenn-user-upload/z9tslodoabnwo8g4vkn7hk8lm4yf)

LIFFアプリ名とLIFFサイズを設定します。
アプリ名は基本的にはチャネル名と同名でいいと思います。
LIFFサイズは今回は`Tall`を設定します。
`Tall`にするとLIFFアプリがLINEアプリの8割ぐらいを覆うように表示されるようになります。

![LIFF Setting001](https://storage.googleapis.com/zenn-user-upload/kgtz6g17nnm1i6gli6jjhauu82e5)

更に、項目を埋めていきます。

* エンドポイントURL
* 前章で作成したCloudFrontのURL( https://***********.cloudfront.net )を設定
* Scope
* profileをチェック
* ボットリンク機能
* On (Aggressive)をチェック

最後に[作成]を押してください。
![LIFF Setting 002](https://storage.googleapis.com/zenn-user-upload/svddekwxpskd8g4mj41djl5diri4)

これでLIFFアプリができました🎉

LIFF IDとLIFF URLはこの後使うのでメモっておいてください。
![new LIFF Application](https://storage.googleapis.com/zenn-user-upload/qbd9dkkudk151yuojw9r95z8q5pg)

## 4.3 公式アカウント用新規チャネルを作成する
次にLIFFアプリの入り口にあたるLINE公式アカウントを作っていきます。

まず、LINE Developerのページから新規チャネル作成をクリックします。

![new LINE Channel 002](https://storage.googleapis.com/zenn-user-upload/zceefhprbq9scyxhyjfl574i31d9)

今度は、Messaging API をクリックします。
![new LINE Messaging API](https://storage.googleapis.com/zenn-user-upload/540gxtzx2n7v1ajbdtos0mtqp57r)

項目を入力してきます。
* チャネルアイコン(任意)
* アプリのアイコン
* こだわりのない人はとりあえず、[こちら](https://github.com/Arahabica/line-member-card-hands-on/blob/main/resources/icon.png)の画像を設定してください。
* チャネル名
* 公式アカウントの名前
* チャネル説明
　　 * 説明
* 大業種
* 今回はカフェの会員証というテイなので、「飲食店・レストラン」を選びます。
* 小業種
* 「カフェ・喫茶店」を選びます
* メールアドレス
* 担当者のメールアドレス


![create LINE Messaging API Channel](https://storage.googleapis.com/zenn-user-upload/8buwfl6yh9cpflh71flr38gjvcqn)
規約を読んで、チェックして「作成」を押します。

![](https://storage.googleapis.com/zenn-user-upload/p3fyva206xxyl7j19a8yt5h0b9gk)

これで、公式アカウントとMessaging APIのチャネルが作成できました🎉


## 4.4 リッチメニューの作成
次に、公式アカウントのトップページに表示するリッチメニューを作っていきます。

設定は別のページで行うので、`LINE Official Account Manager`のリンクをクリックします。
![RichMenu Link](https://storage.googleapis.com/zenn-user-upload/6lfh4qjgjqpr0wrnsm8ucs3ahdpl)

[ホーム] > [トークルーム管理] > [リッチメニュー]の順に選択していきます。
[作成]を押します。

![RichMenu Setting 001](https://storage.googleapis.com/zenn-user-upload/o8q9c81m9sllavgcx55turv4ft7b)

また、項目を入力していきます。
* タイトル
* 管理画面で管理するためだけのものなので適当で
* 表示期間
* 2021/04/01 - 2029/04/01

![RichMenu Setting 002](https://storage.googleapis.com/zenn-user-upload/gtxez1cbe1ultlwzlk5bq54nd5ic)

［テンプレートを選択］ボタンをクリックします。
![choose template](https://storage.googleapis.com/zenn-user-upload/nveboarerhmg8ejueac9sxds236j)

左下のテンプレートを選択して、［選択］ボタンをクリックします。
![choose template 02](https://storage.googleapis.com/zenn-user-upload/0endk494fa7u5li2tmcm871gm8ic =300x)

次に、背景画像をアップロードします。
[背景画像をアップロード]をクリックします。
![setting richmenu image](https://storage.googleapis.com/zenn-user-upload/8nhjyv3bkyko6a4enjf6hadltvez)

次のフォームに背景画像をアップロードしてください。
解像度は指定されているので気をつけてください。

![upload richmenu image](https://storage.googleapis.com/zenn-user-upload/8xppp555g843zi8njtvhxilj22th =300x)

今回はGitに入れてある下記の画像をアップロードしてください。
https://github.com/Arahabica/line-member-card-hands-on/blob/main/resources/richmenu.png

次にアクションの設定をします。

* タイプ
* リンク
* URL
* 4.2で生成されたLIFFのURLを指定する 例）https://liff.line.me/xxxxxxxxxx-xxxxxxxx
* アクションラベル
* Member Card

![RichMenu Action Setting](https://storage.googleapis.com/zenn-user-upload/253actizd44d4n3duja5ed15a3vw)


これで、リッチメニュー が作成できました🎉
![created RichMenu](https://storage.googleapis.com/zenn-user-upload/4us1efxtv6oeop6zx2jxvqk37fgk)


## 4-5 友だちになる
`LINE Official Account Manager`で
[ホーム] > [友だちを増やす] の順で選択します。
表示されているQRコードから公式アカウント友達になってください。

![LINE QR](https://storage.googleapis.com/zenn-user-upload/ncdcqxjc4lw9bh8kr7zvk7h1vh01)

リッチメニューをタップしてください。

![LINE Official Account 001](https://storage.googleapis.com/zenn-user-upload/ow1lwl2qa9wnjr18cacbcrixg06b =250x)

下図のように表示されれば、成功です🎉
こちらがあなたが作成したLIFFアプリになります。

![LINE Official Account 002](https://storage.googleapis.com/zenn-user-upload/nx9k0hoowvzxj0f1et7ijd1s7yqn =250x)

しかし、これだとただWebサイトを表示しているだけなので面白くないですね。

次章で、これを会員証にしていきます。
