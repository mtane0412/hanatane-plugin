# Ghost Admin API MCP Server

このMCPサーバーは、Ghost Admin APIとの統合を提供し、pg-writerプラグインからGhostブログの操作を可能にします。

## 機能

以下のツールを提供します:

1. **ghost_get_posts**: 記事一覧を取得
2. **ghost_get_post**: 特定の記事を取得
3. **ghost_create_post**: 新しい記事を作成
4. **ghost_update_post**: 既存の記事を更新
5. **ghost_delete_post**: 記事を削除

## セットアップ

### 1. 依存関係のインストール

```bash
cd mcp/ghost
npm install
```

### 2. TypeScriptのビルド

```bash
npm run build
```

これにより、`dist/index.js`が生成されます。

### 3. Ghost Admin API キーの取得

1. GhostダッシュボードにログインGhost CMS
   - `Settings` → `Integrations` → `Add custom integration`
2. 統合名を入力(例: "pg-writer")
3. `Create`をクリック
4. **Admin API Key**をコピー

Admin API Keyは以下の形式です:
```
[id]:[secret]
```

### 4. 環境変数の設定

プロジェクトルートの`.claude/pg-writer.local.md`に以下を追加:

```markdown
# pg-writer Settings

## Ghost API Configuration
- GHOST_URL: https://your-blog.ghost.io
- GHOST_ADMIN_API_KEY: your_admin_api_key_here
```

または、`mcp/ghost/.env`ファイルを作成:

```bash
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_admin_api_key_here
```

## テスト

### ローカルテスト

MCPサーバーをスタンドアロンでテストできます:

```bash
cd mcp/ghost
npm start
```

### Claude Codeでのテスト

Claude Codeから利用可能なツールを確認:

```bash
cc --mcp-server ./mcp/ghost/.mcp.json
```

## ツールの使用方法

### 記事一覧の取得

```typescript
{
  "name": "ghost_get_posts",
  "arguments": {
    "limit": 10,
    "filter": "status:published"
  }
}
```

### 特定記事の取得

**slugで取得**:
```typescript
{
  "name": "ghost_get_post",
  "arguments": {
    "slug": "my-essay-title"
  }
}
```

**IDで取得**:
```typescript
{
  "name": "ghost_get_post",
  "arguments": {
    "id": "63a5f1b2c3d4e5f6g7h8i9j0"
  }
}
```

### 新規記事の作成

```typescript
{
  "name": "ghost_create_post",
  "arguments": {
    "title": "新しいエッセイ",
    "html": "<p>これは本文です。</p>",
    "slug": "new-essay",
    "status": "draft",
    "tags": ["essay", "blog"]
  }
}
```

### 記事の更新

```typescript
{
  "name": "ghost_update_post",
  "arguments": {
    "id": "63a5f1b2c3d4e5f6g7h8i9j0",
    "updated_at": "2024-01-15T10:00:00.000Z",
    "title": "更新されたタイトル",
    "html": "<p>更新された本文</p>",
    "status": "published"
  }
}
```

**注意**: `updated_at`は楽観的ロックのために必須です。記事を取得した時点の`updated_at`値を使用してください。

### 記事の削除

```typescript
{
  "name": "ghost_delete_post",
  "arguments": {
    "id": "63a5f1b2c3d4e5f6g7h8i9j0"
  }
}
```

## トラブルシューティング

### エラー: "GHOST_URL と GHOST_ADMIN_API_KEY を環境変数に設定してください"

環境変数が正しく設定されていません。`.env`ファイルまたは`.claude/pg-writer.local.md`を確認してください。

### エラー: "VersionMismatchError: API version is not compatible"

Ghost APIのバージョンが互換性がありません。`src/index.ts`の`version`を確認してください:

```typescript
const api = new GhostAdminAPI({
  url: ghostUrl,
  key: adminApiKey,
  version: "v5.0", // ← ここを変更
});
```

### エラー: "ValidationError: Validation failed for post"

送信したデータが不正です。以下を確認してください:
- `title`と`html`は必須です
- `status`は "draft" または "published" のみ
- `updated_at`(更新時)は最新の値を使用

### エラー: "NotFoundError: Resource could not be found"

指定したslugまたはIDの記事が存在しません。以下を確認してください:
- slugまたはIDが正しいか
- 記事が削除されていないか

## 開発

### ファイル構造

```
mcp/ghost/
├── package.json
├── tsconfig.json
├── .env (optional)
├── src/
│   └── index.ts
├── dist/ (ビルド後)
│   └── index.js
└── README.md
```

### ビルドと実行

開発中は、watchモードでビルドできます:

```bash
npm run dev
```

別のターミナルで実行:

```bash
npm start
```

### デバッグ

デバッグ出力を有効にするには、`DEBUG`環境変数を設定:

```bash
DEBUG=* npm start
```

## Ghost API リファレンス

詳細なAPIドキュメント:
- [Ghost Admin API Documentation](https://ghost.org/docs/admin-api/)
- [Ghost Admin API JavaScript Library](https://github.com/TryGhost/SDK/tree/main/packages/admin-api)

## ライセンス

MIT
