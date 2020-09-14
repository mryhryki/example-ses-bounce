# example-ses-bounce

SESの送信APIとバウンス時の処理をまとめたサンプル実装です。

※ブログ用の実験的なサンプル実装のため、このコードを使った運用などは決してしないでください！

## 構成図

[![example-ses-bounce.png](https://i.gyazo.com/f02ba512d46d49f2d64442da4bfb4ea7.png)](https://app.cloudcraft.co/view/bc7ea2ca-56e2-4c8f-9843-b133e1a1ccc0?key=glv7fZrg2BKmykYywxwZdw)

1. `API Gateway` でメールのデータを受け取る
2. `Lambda` で処理を実行
3. `DynamoDB` にバウンスした履歴がないかを問い合わせる（履歴がある場合はSESで送信せず処理を中断する）
4. `SES` へメールの情報を送信する
5. `SES` からメールを配信する（バウンスした場合は `SES` に戻る）
6. 設定してある `SNS Topic` へバウンスした情報を送信する
7. `SNS Topic` から `Lambda` へバウンスデータを送信して処理する
8. `DynamoDB` にバウンスした履歴を保存する

## 使い方

### 前提

1. `AWS` のアクセスキーが環境変数や設定ファイルなどに設定済みであること
2. `AWS SES` で送信可能な状態に設定が済んでいること

### serverless.yml の編集

`serverless.yml` の `custom` セクションを必要に応じて編集します。

- `deploymentBucketName`: デプロイ用のS3バケット名を指定します。
- `sesSenderAddress`: `AWS SES` から送信可能なメールアドレスを指定します。

### デプロイ

```bash
# 必要パッケージのインストール
$ npm ci

# デプロイ
$ npm run deploy

# 削除
$ npm run remove
```

デプロイ時に `API Gateway` のエンドポイントが表示されまます。

```text
...
endpoints:
  POST - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
functions:
...
```

このエンドポイントに対して、JSON を渡すとメールが送信できます。

### SES の設定

デプロイすると `example-ses-bounce` という SNS Topic が作成されています。
これを SES のバウンス時に通知する SNS Topic として指定します。

![SES Config](https://i.gyazo.com/2d509cf45cd93925790ca65d17c6cf70.png)

### 動作確認

以下は `curl` での実行例です。

```bash
$ curl -X POST \
       -d '{"to":"bounce@simulator.amazonses.com","subject":"TEST","body":"test mail."}' \
       https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
```

※`bounce@simulator.amazonses.com` は AWS が用意している、バウンステスト用のアドレスです。
このアドレスはバウンス率にカウントされません。

[Testing email sending in Amazon SES - Amazon Simple Email Service](https://docs.aws.amazon.com/ja_jp/ses/latest/DeveloperGuide/send-email-simulator.html)

初回は成功し、以下のレスポンスが返ります。

```json
{
  "message": "Success"
}
```

しばらく時間を置いてアクセスすると、バウンスが検知されているので以下のレスポンスが返ります。

```json
{
  "message": "Bounced address"
}
```
