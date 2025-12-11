---
description: GhostブログにPost記事を公開する
argument-hint: "[file_path] [--draft] [--update]"
allowed-tools:
  - Read
  - Bash
---

# /publish コマンド

このコマンドは、Markdownファイルを読み込んでGhost Admin APIを使ってブログに公開します。

## あなたがすべきこと

### 1. 引数を解析する

ユーザーが提供した引数を確認してください:

**基本形式**(新規公開):
```
/publish essay.md
/publish /path/to/article.md
```

**下書きとして保存**:
```
/publish essay.md --draft
```

**既存記事を更新**:
```
/publish essay.md --update
```

**オプションの組み合わせ**:
```
/publish essay.md --update --draft
```

**引数がない場合**:
ユーザーに尋ねてください:
```
公開したいMarkdownファイルのパスを教えてください。

例: /publish essay.md
```

### 2. Markdownファイルを読み込む

`Read` ツールを使ってファイルを読み込んでください。

**frontmatterの解析**:
以下のfrontmatter項目を抽出してください:

```yaml
---
title: 記事タイトル
slug: url-slug
status: published or draft
tags: [tag1, tag2, tag3]
published_at: 2024-01-15T10:00:00Z
ghost_id: 63a5f1b2c3d4e5f6 (更新時のみ必要)
---
```

**本文の抽出**:
frontmatter の後の部分が記事本文です。

**MarkdownからHTMLへの変換**:
Ghost APIはHTML形式を期待します。Markdownを基本的なHTMLに変換してください:
- `# 見出し1` → `<h1>見出し1</h1>`
- `## 見出し2` → `<h2>見出し2</h2>`
- `**太字**` → `<strong>太字</strong>`
- `*斜体*` → `<em>斜体</em>`
- `[リンク](URL)` → `<a href="URL">リンク</a>`
- 段落は `<p>` タグで囲む

### 3. Ghost API設定を確認する

Ghost APIを使用する前に、必要な設定が揃っているか確認してください。

**必要な環境変数**:
- `GHOST_URL`: Ghost サイトのURL
- `GHOST_ADMIN_API_KEY`: Ghost Admin APIキー

設定が不足している場合は、ユーザーに指示を表示してください(fetch-postコマンドと同様)。

### 4. 公開/更新処理を決定する

**新規公開** (`--update` なし、またはfrontmatterに `ghost_id` なし):
- Ghost APIの `POST /posts/` エンドポイントを使用
- 新しい記事として作成

**既存記事の更新** (`--update` あり、またはfrontmatterに `ghost_id` あり):
- Ghost APIの `PUT /posts/{id}/` エンドポイントを使用
- 既存の記事を更新

**判定ロジック**:
1. `--update` フラグがある → 更新モード
2. frontmatterに `ghost_id` がある → 更新モード
3. どちらもない → 新規公開モード

### 5. 記事データを準備する

Ghost APIに送信するJSONデータを準備してください:

```json
{
  "posts": [{
    "title": "記事タイトル",
    "slug": "url-slug",
    "html": "<p>HTML形式の本文</p>",
    "status": "published",
    "tags": ["tag1", "tag2"],
    "published_at": "2024-01-15T10:00:00Z"
  }]
}
```

**デフォルト値**:
- `status`: `--draft` フラグがあれば "draft"、なければ "published"
- `slug`: 指定がなければタイトルから自動生成(小文字、スペースをハイフンに)
- `published_at`: 指定がなければ現在時刻

### 6. Ghost APIで公開/更新する

**新規公開のcurlコマンド例**:
```bash
curl -X POST "https://your-blog.ghost.io/ghost/api/admin/posts/" \
  -H "Authorization: Ghost $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"posts": [...]}'
```

**更新のcurlコマンド例**:
```bash
curl -X PUT "https://your-blog.ghost.io/ghost/api/admin/posts/{id}/" \
  -H "Authorization: Ghost $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"posts": [...]}'
```

### 7. 結果を報告する

**成功した場合**:
```
✓ 記事を公開しました: "[タイトル]"

詳細:
- URL: https://your-blog.ghost.io/my-essay-title/
- Status: published
- Tags: essay, startup
- Published: 2024-01-15 10:00

Ghost ID: 63a5f1b2c3d4e5f6

このIDをfrontmatterに追加しておくと、次回から更新ができます:

---
title: 記事タイトル
ghost_id: 63a5f1b2c3d4e5f6
---
```

**下書きとして保存した場合**:
```
✓ 記事を下書きとして保存しました: "[タイトル]"

Ghostダッシュボードで編集・公開できます:
https://your-blog.ghost.io/ghost/#/editor/post/63a5f1b2c3d4e5f6
```

**更新した場合**:
```
✓ 記事を更新しました: "[タイトル]"

更新内容:
- 本文を更新
- タグを追加: new-tag
- 最終更新: 2024-01-20 15:30

記事URL: https://your-blog.ghost.io/my-essay-title/
```

### 8. ファイルの更新(オプション)

公開/更新後、元のMarkdownファイルのfrontmatterを更新することをユーザーに提案してください:

```
元のファイル(essay.md)のfrontmatterを更新しますか?

以下の情報を追加します:
- ghost_id: 63a5f1b2c3d4e5f6
- published_at: 2024-01-15T10:00:00Z
- status: published

[はい/いいえ]
```

ユーザーが「はい」と答えた場合、`Edit` ツールを使ってfrontmatterを更新してください。

### 9. エラーハンドリング

以下のエラーに対処してください:

**ファイルが見つからない**:
```
ファイルが見つかりません: essay.md

ファイルパスが正しいか確認してください。
```

**frontmatterが不正**:
```
frontmatterの解析に失敗しました。

frontmatterの形式を確認してください:

---
title: 記事タイトル
slug: url-slug
---
```

**タイトルがない**:
```
エラー: 記事タイトルが指定されていません。

frontmatterに title を追加してください:

---
title: あなたの記事タイトル
---
```

**slug の重複**:
```
エラー: このslugは既に使用されています: "my-essay-title"

別のslugを指定するか、--update フラグを使って既存記事を更新してください。
```

**API認証エラー**:
```
Ghost API認証エラー

GHOST_ADMIN_API_KEYが正しいか確認してください。
```

**ネットワークエラー**:
```
Ghost APIへの接続に失敗しました。

インターネット接続とGhost URLを確認してください。
```

## 使用例

### 例1: 新規記事を公開

```
ユーザー: /publish essay.md

あなた:
1. essay.md を読み込む
2. frontmatterを解析
3. Markdown → HTMLに変換
4. Ghost APIで新規公開
5. 成功メッセージとGhost IDを表示
6. frontmatter更新を提案
```

### 例2: 下書きとして保存

```
ユーザー: /publish draft-essay.md --draft

あなた:
1. ファイルを読み込む
2. status を "draft" に設定
3. Ghost APIで下書き保存
4. ダッシュボードのURLを表示
```

### 例3: 既存記事を更新

```
ユーザー: /publish essay.md --update

あなた:
1. ファイルを読み込む
2. frontmatterから ghost_id を取得
3. Ghost APIで記事を更新
4. 更新内容を報告
```

### 例4: 下書きを公開に変更

```
ユーザー: /publish draft-essay.md --update

あなた:
1. ファイルを読み込む
2. ghost_id で記事を取得
3. status を "published" に更新
4. 公開URLを表示
```

## 高度な機能(オプション)

### アイキャッチ画像の設定

frontmatterに `feature_image` が指定されている場合:

```yaml
---
title: 記事タイトル
feature_image: https://example.com/image.jpg
---
```

Ghost APIに feature_image を含めて送信してください。

### カスタムexcerpt(抜粋)

frontmatterに `excerpt` が指定されている場合:

```yaml
---
title: 記事タイトル
excerpt: この記事の要約...
---
```

Ghost APIに custom_excerpt として送信してください。

### 公開日時の予約

未来の日時を `published_at` に指定した場合、Ghost はその日時に自動公開します:

```yaml
---
title: 記事タイトル
published_at: 2024-02-01T09:00:00Z
---
```

## 重要な注意事項

### 1. 取り消し不可能

一度公開すると、すぐに読者に見えるようになります。公開前に内容を確認してください。

### 2. slugの重要性

slug はURLの一部になります。一度公開したら変更しないことを推奨します(SEOに影響)。

### 3. タグの管理

存在しないタグは自動的に作成されます。タグ名は慎重に選んでください。

### 4. HTMLの品質

複雑なMarkdownは、HTMLへの変換が不完全な場合があります。公開後、Ghostダッシュボードで確認することを推奨します。

## まとめ

`/publish` コマンドの流れ:

1. 引数を解析する(ファイルパス、オプション)
2. Markdownファイルを読み込む
3. frontmatterと本文を抽出
4. Markdown → HTMLに変換
5. Ghost API設定を確認
6. 新規公開 or 更新を決定
7. Ghost APIで公開/更新
8. 結果を報告
9. frontmatter更新を提案

常に、ユーザーに明確なフィードバックを提供してください。
