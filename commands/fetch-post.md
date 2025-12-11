---
description: GhostブログからPost記事を取得する
argument-hint: "[slug or id] [--save-as filename]"
allowed-tools:
  - Write
  - Bash
---

# /fetch-post コマンド

このコマンドは、Ghost Admin APIを使ってブログ記事を取得し、ローカルファイルとして保存します。

## あなたがすべきこと

### 1. 引数を解析する

ユーザーが提供した引数を確認してください:

**基本形式**:
```
/fetch-post [slug or id]
/fetch-post my-essay-slug
/fetch-post 63a5f1b2c3d4e5f6g7h8i9j0
```

**オプション付き**:
```
/fetch-post my-essay-slug --save-as custom-name.md
/fetch-post 63a5f1b2 --save-as essay.md
```

**引数がない場合**:
ユーザーに尋ねてください:
```
取得したい記事のslugまたはIDを教えてください。

slugの例: my-essay-title
IDの例: 63a5f1b2c3d4e5f6g7h8i9j0
```

### 2. Ghost Admin API設定を確認する

Ghost APIを使用する前に、必要な設定が揃っているか確認してください。

**必要な環境変数**:
- `GHOST_URL`: Ghost サイトのURL(例: https://your-blog.ghost.io)
- `GHOST_ADMIN_API_KEY`: Ghost Admin APIキー

これらの設定は、`.claude/pg-writer.local.md`ファイルまたは環境変数から読み取ります。

**設定が不足している場合**:
```
Ghost API設定が不足しています。

以下の設定を`.claude/pg-writer.local.md`に追加してください:

```markdown
# pg-writer Settings

## Ghost API Configuration
- GHOST_URL: https://your-blog.ghost.io
- GHOST_ADMIN_API_KEY: your_admin_api_key_here
\```

Ghost Admin APIキーの取得方法:
1. Ghostダッシュボードにログイン
2. Settings → Integrations → Add custom integration
3. 名前を付けて(例: "pg-writer")保存
4. Admin API Keyをコピー
```

### 3. 記事を取得する

Ghost Admin APIを使って記事を取得します。

**curlコマンドの例** (実際のAPIキー形式に注意):
```bash
curl "https://your-blog.ghost.io/ghost/api/admin/posts/slug/my-essay-slug/" \
  -H "Authorization: Ghost $ADMIN_API_KEY"
```

**取得する情報**:
- title: 記事タイトル
- html: 記事本文(HTML形式)
- plaintext: 記事本文(プレーンテキスト)
- slug: URLスラグ
- status: 公開状態(published, draft)
- published_at: 公開日時
- updated_at: 更新日時
- tags: タグ一覧
- authors: 著者情報

### 4. Markdown形式に変換する

取得した記事を、以下の形式のMarkdownファイルに変換してください:

```markdown
---
title: [記事タイトル]
slug: [slug]
status: [published or draft]
published_at: [公開日時]
updated_at: [更新日時]
tags: [タグ1, タグ2, ...]
ghost_id: [記事ID]
---

# [記事タイトル]

[記事本文]
```

**HTMLからMarkdownへの変換**:
- Ghost APIは主にHTML形式で本文を返します
- 可能な限りMarkdownに変換してください
- 複雑なHTMLは、そのまま残しても構いません

### 5. ファイルとして保存する

変換したMarkdownを、ローカルファイルとして保存してください。

**デフォルトのファイル名**:
`[slug].md`

例:
- slug が `my-essay-title` なら → `my-essay-title.md`

**カスタムファイル名**:
ユーザーが `--save-as` オプションを指定した場合、そのファイル名を使用してください。

**保存場所**:
現在の作業ディレクトリに保存してください。

**保存確認**:
```
記事を取得しました: "[タイトル]"

以下の情報:
- Status: published
- Published: 2024-01-15
- Tags: essay, startup
- 文字数: 約3,500字

ファイルに保存しました: my-essay-title.md
```

### 6. エラーハンドリング

以下のエラーに対処してください:

**記事が見つからない場合**:
```
記事が見つかりませんでした: "my-essay-slug"

以下を確認してください:
1. slugまたはIDが正しいか
2. 記事が実際に存在するか
3. API権限があるか
```

**API認証エラーの場合**:
```
Ghost API認証エラー

以下を確認してください:
1. GHOST_ADMIN_API_KEYが正しいか
2. API keyが有効期限内か
3. 権限が適切に設定されているか
```

**ネットワークエラーの場合**:
```
Ghost APIへの接続に失敗しました。

以下を確認してください:
1. GHOST_URLが正しいか
2. インターネット接続があるか
3. Ghostサイトが稼働しているか
```

## 使用例

### 例1: slug で取得

```
ユーザー: /fetch-post my-first-essay

あなた:
1. Ghost API設定を確認
2. slug "my-first-essay" で記事を取得
3. Markdown形式に変換
4. my-first-essay.md として保存
5. 成功メッセージを表示
```

### 例2: IDで取得してカスタムファイル名

```
ユーザー: /fetch-post 63a5f1b2c3d4e5f6 --save-as essay-draft.md

あなた:
1. ID "63a5f1b2c3d4e5f6" で記事を取得
2. Markdown形式に変換
3. essay-draft.md として保存
4. 成功メッセージを表示
```

### 例3: 下書きの取得

```
ユーザー: /fetch-post draft-essay

あなた:
1. 記事を取得
2. statusが "draft" であることを確認
3. frontmatterに status: draft と記載
4. 保存して確認メッセージ
```

## 高度な機能(オプション)

### 複数記事の一括取得

ユーザーが複数の記事を取得したい場合:

```
ユーザー: /fetch-post --all
または
/fetch-post --tag essay
```

この場合:
1. 条件に合う記事一覧を取得
2. 各記事を個別のファイルとして保存
3. 保存した記事数を報告

### 画像のダウンロード

記事に画像が含まれる場合:
1. 画像URLを抽出
2. ローカルにダウンロード(オプション)
3. Markdownの画像パスを更新

## 重要な注意事項

### 1. API使用制限

Ghost APIには使用制限があります。短時間に大量のリクエストを送らないでください。

### 2. セキュリティ

GHOST_ADMIN_API_KEYは機密情報です。ログに出力しないでください。

### 3. データの整合性

取得した記事の内容を変更しないでください。元のデータを忠実に保存してください。

## まとめ

`/fetch-post` コマンドの流れ:

1. 引数を解析する(slug or ID)
2. Ghost API設定を確認する
3. Ghost Admin APIで記事を取得する
4. Markdown形式に変換する
5. ローカルファイルとして保存する
6. 成功メッセージを表示する

エラーが発生した場合は、わかりやすいエラーメッセージを表示してください。
