# pg-writer

ポール・グレアム風のエッセイ執筆を支援するClaude Codeプラグインです。

## 概要

pg-writerは、ポール・グレアムの執筆哲学に基づいたエッセイ執筆をサポートします。明快さ、シンプルさ、会話調の文体を重視し、Ghost CMSとの統合により執筆から公開までのワークフローを効率化します。

## 機能

### Skills
- **pg-writing-philosophy**: ポール・グレアムの執筆哲学ガイド
  - 明快でシンプルな文章
  - 会話調の文体
  - 具体例の活用
  - 反復的なリライト

### Commands
- `/refine [file_path or text]`: テキストをポール・グレアム風に編集・推敲
- `/fetch-post [slug or id]`: Ghostブログから記事を取得
- `/publish [file_path] [--draft] [--update]`: Ghostブログに記事を公開

### Agents
- **pg-editor**: ポール・グレアム風の編集を自律的に実行し、反復的な改善を提案

### MCP統合
- **Ghost Admin API**: ブログ記事の取得・作成・更新・公開

## インストール

### 前提条件
- Claude Code CLI
- Ghost Admin APIキー
- Node.js (MCPサーバー用)

### セットアップ

1. このリポジトリをクローンまたはダウンロード:
```bash
git clone https://github.com/mtane0412/hanatane-plugin.git pg-writer
cd pg-writer
```

2. MCPサーバーの依存関係をインストールとビルド:
```bash
cd mcp/ghost
npm install
npm run build
cd ../..
```

3. Ghost Admin APIキーを取得:
   - Ghostダッシュボードにログイン
   - `Settings` → `Integrations` → `Add custom integration`
   - 名前を入力(例: "pg-writer")して保存
   - **Admin API Key**をコピー

4. 環境変数ファイル `.env` を作成:
```bash
# プロジェクトルートに作成
cat > .env << 'EOF'
GHOST_URL=https://your-blog.ghost.io
GHOST_ADMIN_API_KEY=your_admin_api_key_here
EOF
```

**注意**: `.env`ファイルは`.gitignore`に含まれており、Gitにコミットされません。

5. MCP設定ファイルを作成:
```bash
# .claude/.mcp.json.example をコピー
cp .claude/.mcp.json.example .claude/.mcp.json
```

`.claude/.mcp.json`の内容:
```json
{
  "mcpServers": {
    "ghost": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/mcp/ghost/dist/index.js"],
      "env": {
        "GHOST_URL": "${GHOST_URL}",
        "GHOST_ADMIN_API_KEY": "${GHOST_ADMIN_API_KEY}"
      }
    }
  }
}
```

**注意**:
- `${CLAUDE_PLUGIN_ROOT}`は自動的にプラグインディレクトリに解決されます
- `${GHOST_URL}`と`${GHOST_ADMIN_API_KEY}`は`.env`ファイルから読み込まれます
- `.claude/.mcp.json`は`.gitignore`に含まれており、Gitにコミットされません

6. プラグインを有効化:
```bash
cc --plugin-dir /path/to/pg-writer
```

## 使用方法

### エッセイの編集

既存のテキストファイルをPG風に編集:
```bash
/refine essay.md
```

テキストを直接入力して編集:
```bash
/refine "This is my essay text..."
```

### Ghostブログとの連携

記事を取得:
```bash
/fetch-post my-essay-slug
```

記事を公開:
```bash
/publish essay.md
```

下書きとして保存:
```bash
/publish essay.md --draft
```

既存記事を更新:
```bash
/publish essay.md --update
```

## ポール・グレアムの執筆哲学

このプラグインは以下の原則に基づいています:

1. **明快さ**: 複雑なアイデアをシンプルに表現する
2. **会話調**: 読者に話しかけるように書く
3. **具体例**: 抽象的な概念を具体例で説明する
4. **リライト**: 何度も書き直して洗練させる
5. **アイデア駆動**: 良いアイデアから始める

## ライセンス

MIT

## 作者

mtane0412

## 将来の拡張予定

- Cosense API統合(知識ベース参照)
- Raindrop.io API統合(ブックマーク参照)
- `/draft` コマンド(アイデアから執筆)
