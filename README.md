## アプリケーション名

〇〇幼稚園連絡アプリ

> [!IMPORTANT]
> 仕様を記入します

## 環境構築

1.  `git clone git@github.com:kasahara-dev/kasahara-spa1.git`
2.  `cd spa`
3.  `make init`

> [!IMPORTANT]
> MySQL は、OS によって起動しない場合があるのでそれぞれの PC に合わせて docker-compose.yml ファイルを編集してください

> [!IMPORTANT]
> "The stream or file could not be opened"エラーが発生した場合
> src ディレクトリにある storage ディレクトリに権限を設定してください
> `chmod -R 777 storage`

## テスト手順

`make test`

> [!NOTE]
> PHPUnit→dusk の順に実行されます

## 使用技術

- PHP 8.1.33
- Laravel 8.83.29
- MySQL 8.0.26

## テーブル仕様

<details>
<summary>users テーブル</summary>

| カラム名          | 型              | primary key | unique key | not null | foreign key |
| ----------------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id                | unsigned bigint | 〇          |            | 〇       |             |
| name              | string          |             |            | 〇       |             |
| email             | string          |             | 〇         | 〇       |             |
| email_verified_at | timestamp       |             |            |          |             |
| password          | string          |             |            | 〇       |             |
| remember_token    | string          |             |            |          |             |
| created_at        | timestamp       |             |            |          |             |
| updated_at        | timestamp       |             |            |          |             |

</details>


## ER 図

![ER図](ER.drawio.png)

## URL

- 保護者ログインページ：http://localhost/login
- 職員ログインページ：http://localhost/staff/login

## テストユーザー

- 保護者1ID：`202401001` パスワード：`password`
- 職員1ID：`S2021001` パスワード：`password`

> [!IMPORTANT]
> 作成中です
