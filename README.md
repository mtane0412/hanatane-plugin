# pg-writer

ゼロから最高の執筆体験を支えるClaude Codeプラグインです。

## 概要

pg-writerは、アイデアの発掘から記事の公開まで、執筆の全プロセスをサポートします。ソクラテス式問答法、Ira Glass式ストーリーテリング、Michael Bungay Stanier式コーチング、そしてポール・グレアムの執筆哲学を組み合わせた、体系的な執筆ワークフローを提供します。

## 完全な執筆ワークフロー

```
ゼロの状態
  ↓
[discovery] アイデアの発掘(ソクラテス式問答法)
  ↓
[storytelling] エピソードの具体化(Ira Glass式)
  ↓
[structure] 構造の明確化(Bungay Stanier式)
  ↓
[pg-editor] 文章のリファインメント(Paul Graham式)
  ↓
完成されたエッセイ
  ↓
[Ghost CMS] 記事の公開
```

## 機能

### Agents (自律エージェント)

#### 1. discovery (発見フェーズ)
**手法**: ソクラテス式問答法
**目的**: 何を考えているか、なぜそれが重要かを掘り起こす
**特徴**:
- 産婆術(maieutics)で思考を引き出す
- 記事種別を自動識別(技術解説/経験談/意見/アイデア/ストーリー)
- 種別に応じた質問戦略を展開
- 核心的なメッセージを言語化

#### 2. storytelling (具体化フェーズ)
**手法**: Ira Glass式ストーリーテリング
**目的**: 具体的なエピソードと感情を引き出す
**特徴**:
- Anecdote + Reflection の公式
- 映画のシーンのように詳細化
- 五感に訴える描写
- 「具体性が普遍性を生む」

#### 3. structure (構造化フェーズ)
**手法**: Michael Bungay Stanier式コーチング
**目的**: 「読者にとって何が価値か?」を明確にする
**特徴**:
- 7つの本質的な質問
- トレードオフの明確化(何を含め、何を省くか)
- 論理的な構成設計
- 読者視点の徹底

#### 4. pg-editor (リファインメントフェーズ)
**手法**: Paul Graham式執筆哲学
**目的**: 明快でシンプルな文章に磨き上げる
**特徴**:
- 会話調の文体
- 短い文、短い段落
- 冗長な表現の削除
- 反復的な改善提案

### Skills (参照知識)

- **socratic-method**: ソクラテス式問答法の原理と実践技法
- **anecdote-reflection**: Ira Glass式ストーリーテリング
- **coaching-questions**: Michael Bungay Stanierの7つの本質的な質問
- **pg-writing-philosophy**: Paul Grahamの執筆哲学

### Commands

- `/interview [topic]`: インタビューを通じてアイデアを発掘し、記事の構造を設計
- `/refine [file_path or text]`: テキストをポール・グレアム風に編集・推敲
- `/fetch-post [slug or id]`: Ghostブログから記事を取得
- `/publish [file_path] [--draft] [--update]`: Ghostブログに記事を公開

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

### ゼロからの執筆ワークフロー

#### 方法1: /interview コマンドを使用(推奨)

最もシンプルな方法です。1つのコマンドで完全なワークフローを実行します:

```bash
/interview
```

または、トピックを指定して開始:

```bash
/interview "初めてのOSS貢献"
```

`/interview` コマンドが自動的に:
1. **discovery** - アイデアの発掘と記事種別の識別
2. **storytelling** - エピソードの具体化(記事種別に応じて)
3. **structure** - 構造の明確化

を実行し、以下のファイルを生成します:
- `discovery-session-YYYYMMDD-HHMMSS.md`
- `storytelling-session-YYYYMMDD-HHMMSS.md` (該当する場合)
- `structure-session-YYYYMMDD-HHMMSS.md`

完了後、構造設計に基づいて執筆を開始できます。

#### 方法2: 各エージェントを個別に起動

より細かい制御が必要な場合:

**ステップ1: アイデアの発掘**
```
ユーザー: 記事を書きたいんだけど、何を書けばいいかわからない
```

discoveryエージェントが自動的に起動し、ソクラテス式の質問を通じて:
- 記事種別を識別(技術解説/経験談/意見/アイデア/ストーリー)
- 核心的なメッセージを引き出す
- 読者と価値を明確にする

**ステップ2: エピソードの具体化**
```
ユーザー: storytellingで具体化して
```

storytellingエージェントが:
- コアモメント(重要な瞬間)を特定
- 映画のシーンのように詳細化
- Anecdote + Reflectionで構成

**ステップ3: 構造の設計**
```
ユーザー: structureで構成を考えて
```

structureエージェントが:
- 7つの本質的な質問で核心に迫る
- 読者にとっての価値を明確化
- 何を含め、何を省くかを決定
- 論理的な構造を設計

#### 共通の次のステップ

**ステップ4: 文章のリファインメント**

構造設計に基づいて執筆し、磨き上げます:
```bash
/refine draft.md
```

pg-editorエージェントが:
- ポール・グレアム風の文体に編集
- 明快さ、シンプルさを重視
- 反復的な改善を提案

**ステップ5: 公開**

完成した記事をGhostブログに公開:
```bash
/publish article.md
```

### 既存記事の改善

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

## 執筆哲学の統合

このプラグインは、4つの著名な方法論を統合しています:

### 1. ソクラテス式問答法(Socrates)
**原則**: 産婆術(maieutics) - 答えは相手の中にある
**応用**: アイデアの発掘、本質的な問いの特定

### 2. Ira Glass式ストーリーテリング
**原則**: Anecdote + Reflection - 具体性が普遍性を生む
**応用**: エピソードの具体化、感情的な描写

### 3. Michael Bungay Stanier式コーチング
**原則**: 7つの本質的な質問 - 本質に迫り、行動を促す
**応用**: 構造の設計、読者価値の明確化

### 4. Paul Graham式執筆哲学
**原則**: 明快さ、シンプルさ、会話調
**応用**: 文章のリファインメント、反復的な改善

## ライセンス

MIT

## 作者

mtane0412

## エージェント間の連携

各エージェントは、セッション要約ファイルを生成し、次のエージェントに引き継ぐことができます:

```
discovery-session-YYYYMMDD-HHMMSS.md
  ↓ (読み込み)
storytelling-session-YYYYMMDD-HHMMSS.md
  ↓ (読み込み)
structure-session-YYYYMMDD-HHMMSS.md
  ↓ (読み込み)
draft.md (執筆)
  ↓ (編集)
final-article.md
```

## 記事種別の自動識別と対応

discoveryエージェントは、インタビューを通じて記事種別を自動的に識別します:

| 記事種別 | 推奨ワークフロー | 重点要素 |
|---------|----------------|----------|
| **技術解説** | discovery → structure → pg-editor | 実装の具体性、再現性 |
| **経験・学び** | discovery → storytelling → structure → pg-editor | エピソード、普遍的な洞察 |
| **意見・主張** | discovery → structure → pg-editor | 論理的根拠、反論への対応 |
| **アイデア・洞察** | discovery → structure → pg-editor | 新規性、応用可能性 |
| **ストーリー** | discovery → storytelling → pg-editor | 感情的な核心、物語の意味 |

## 将来の拡張予定

- Cosense API統合(知識ベース参照)
- Raindrop.io API統合(ブックマーク参照)
- 記事種別ごとのテンプレート機能
