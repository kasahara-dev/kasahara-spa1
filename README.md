## アプリケーション名

〇〇幼稚園連絡アプリ

> [!IMPORTANT]
> 保護者とスタッフの連絡アプリです。
> カレンダー登録機能、ユーザー登録機能、パスワード変更機能、メッセージ未既読判別機能はありません。別システムで行う想定です。

## 環境構築

1.  `git clone git@github.com:kasahara-dev/kasahara-spa1.git`
2.  `cd kasahara-spa1`
3.  `make init`

> [!IMPORTANT]
> MySQL は、OS によって起動しない場合があるのでそれぞれの PC に合わせて compose.yaml ファイルを編集してください

> [!IMPORTANT]
> "The stream or file could not be opened"エラーが発生した場合
> src ディレクトリにある storage ディレクトリに権限を設定してください
> `chmod -R 777 storage`

## テスト手順

`make test`

> [!NOTE]
> PHPUnit→dusk の順に実行されます

## 使用技術

- PHP 8.5
- Laravel 13.6
- MySQL 8.4
- Next.js 16.2

## テーブル仕様

<details>
<summary>attendances テーブル</summary>

| カラム名    | 型              | primary key | unique key | not null | foreign key |
| ----------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id          | unsigned bigint | 〇          |            | 〇       |             |
| calendar_id | unsigned bigint |             | 〇(UK1)    | 〇       |             |
| user_id     | unsigned bigint |             | 〇(UK1)    | 〇       | 〇(users)   |
| status      | tinyint         |             |            | 〇       |             |
| detail      | string          |             |            |          |             |
| editor_id   | unsigned bigint |             |            |          | 〇(users)   |
| created_at  | timestamp       |             |            |          |             |
| updated_at  | timestamp       |             |            |          |             |
| deleted_at  | timestamp       |             |            |          |             |

</details>

<details>
<summary>events テーブル</summary>

| カラム名    | 型              | primary key | unique key | not null | foreign key   |
| ----------- | --------------- | ----------- | ---------- | -------- | ------------- |
| id          | unsigned bigint | 〇          |            | 〇       |               |
| calendar_id | unsigned bigint |             |            | 〇       | 〇(calendars) |
| title       | string          |             |            | 〇       |               |
| detail      | string          |             |            | 〇       |               |
| editor_id   | unsigned bigint |             |            | 〇       | 〇(users)     |
| created_at  | timestamp       |             |            |          |               |
| updated_at  | timestamp       |             |            |          |               |
| deleted_at  | timestamp       |             |            |          |               |

</details>

<details>
<summary>groups テーブル</summary>

| カラム名   | 型              | primary key | unique key | not null | foreign key |
| ---------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id         | unsigned bigint | 〇          |            | 〇       |             |
| name       | string          |             |            | 〇       |             |
| category   | tinyint         |             |            | 〇       |             |
| created_at | timestamp       |             |            |          |             |
| updated_at | timestamp       |             |            |          |             |

</details>

<details>
<summary>parent_messages テーブル</summary>

| カラム名   | 型              | primary key | unique key | not null | foreign key |
| ---------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id         | unsigned bigint | 〇          |            | 〇       |             |
| from       | unsigned bigint |             |            | 〇       | 〇(users)   |
| detail     | string          |             |            | 〇       |             |
| created_at | timestamp       |             |            |          |             |
| updated_at | timestamp       |             |            |          |             |

</details>

<details>
<summary>profiles テーブル</summary>

| カラム名   | 型              | primary key | unique key | not null | foreign key |
| ---------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id         | unsigned bigint | 〇          |            | 〇       |             |
| user_id    | unsigned bigint |             |            | 〇       | 〇(users)   |
| email1     | string          |             |            | 〇       |             |
| email2     | string          |             |            |          |             |
| email3     | string          |             |            |          |             |
| tel1       | string          |             |            | 〇       |             |
| tel2       | string          |             |            |          |             |
| tel3       | string          |             |            |          |             |
| created_at | timestamp       |             |            |          |             |
| updated_at | timestamp       |             |            |          |             |

</details>

<details>
<summary>staff_messages テーブル</summary>

| カラム名   | 型              | primary key | unique key | not null | foreign key |
| ---------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id         | unsigned bigint | 〇          |            | 〇       |             |
| to_type    | tinyint         |             |            | 〇       |             |
| to         | unsigned bigint |             |            | 〇       | 〇(users)   |
| title      | string          |             |            | 〇       |             |
| detail     | string          |             |            | 〇       |             |
| file_path  | string          |             |            |          |             |
| created_at | timestamp       |             |            |          |             |
| updated_at | timestamp       |             |            |          |             |

</details>

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

<details>
<summary>group_user テーブル</summary>

| カラム名   | 型              | primary key | unique key | not null | foreign key |
| ---------- | --------------- | ----------- | ---------- | -------- | ----------- |
| id         | unsigned bigint | 〇          |            | 〇       |             |
| group_id   | unsigned bigint |             |            | 〇       | 〇(groups)  |
| user_id    | unsigned bigint |             |            | 〇       | 〇(users)   |
| created_at | timestamp       |             |            |          |             |
| updated_at | timestamp       |             |            |          |             |

</details>

## ER 図

![ER図](ER.drawio.png)

## URL

- 保護者ログインページ：http://localhost:3000/login
- 職員ログインページ：http://localhost:3000/staff/login
- Mailpit：http://localhost:8025/

## テストユーザー

- 保護者ID：`202401001` パスワード：`password`
- 職員ID：`S2021001` パスワード：`password`

> [!IMPORTANT]
> 2026年度のカレンダーです。
