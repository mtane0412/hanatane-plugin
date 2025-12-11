#!/usr/bin/env node

/**
 * Ghost Admin API MCP Server
 *
 * このMCPサーバーは、Ghost Admin APIとの統合を提供します。
 * 記事の取得、作成、更新、削除などの操作が可能です。
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
// @ts-ignore - No type definitions available for @tryghost/admin-api
import GhostAdminAPI from "@tryghost/admin-api";
import { config } from "dotenv";

// 環境変数を読み込む
config();

// Ghost Admin API クライアントの初期化
const ghostUrl = process.env.GHOST_URL;
const adminApiKey = process.env.GHOST_ADMIN_API_KEY;

if (!ghostUrl || !adminApiKey) {
  console.error("エラー: GHOST_URL と GHOST_ADMIN_API_KEY を環境変数に設定してください");
  process.exit(1);
}

const api = new GhostAdminAPI({
  url: ghostUrl,
  key: adminApiKey,
  version: "v5.0",
});

// MCPサーバーの作成
const server = new Server(
  {
    name: "pg-writer-ghost",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 利用可能なツールの一覧を提供
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ghost_get_posts",
        description: "Ghost ブログから記事一覧を取得します",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "取得する記事数(デフォルト: 15)",
            },
            filter: {
              type: "string",
              description: "フィルター条件(例: status:published, tag:essay)",
            },
          },
        },
      },
      {
        name: "ghost_get_post",
        description: "特定の記事をslugまたはIDで取得します",
        inputSchema: {
          type: "object",
          properties: {
            slug: {
              type: "string",
              description: "記事のslug(URL末尾の文字列)",
            },
            id: {
              type: "string",
              description: "記事のID",
            },
          },
          oneOf: [
            { required: ["slug"] },
            { required: ["id"] }
          ],
        },
      },
      {
        name: "ghost_create_post",
        description: "新しい記事を作成します",
        inputSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "記事タイトル(必須)",
            },
            html: {
              type: "string",
              description: "記事本文(HTML形式、必須)",
            },
            slug: {
              type: "string",
              description: "URLスラグ(任意、自動生成可)",
            },
            status: {
              type: "string",
              enum: ["draft", "published"],
              description: "公開状態(デフォルト: draft)",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "タグの配列",
            },
            published_at: {
              type: "string",
              description: "公開日時(ISO 8601形式)",
            },
          },
          required: ["title", "html"],
        },
      },
      {
        name: "ghost_update_post",
        description: "既存の記事を更新します",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "記事のID(必須)",
            },
            title: {
              type: "string",
              description: "記事タイトル",
            },
            html: {
              type: "string",
              description: "記事本文(HTML形式)",
            },
            slug: {
              type: "string",
              description: "URLスラグ",
            },
            status: {
              type: "string",
              enum: ["draft", "published"],
              description: "公開状態",
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "タグの配列",
            },
            published_at: {
              type: "string",
              description: "公開日時(ISO 8601形式)",
            },
            updated_at: {
              type: "string",
              description: "最終更新日時(必須、楽観的ロック用)",
            },
          },
          required: ["id", "updated_at"],
        },
      },
      {
        name: "ghost_delete_post",
        description: "記事を削除します",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "削除する記事のID",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

/**
 * ツールの実行を処理
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "ghost_get_posts": {
        const params = args as { limit?: number; filter?: string } | undefined;
        const posts = await api.posts.browse({
          limit: params?.limit || 15,
          filter: params?.filter || undefined,
          include: "tags,authors",
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(posts, null, 2),
            },
          ],
        };
      }

      case "ghost_get_post": {
        const getParams = args as { slug?: string; id?: string } | undefined;
        const post = getParams?.slug
          ? await api.posts.read({ slug: getParams.slug }, { include: "tags,authors" })
          : await api.posts.read({ id: getParams?.id }, { include: "tags,authors" });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(post, null, 2),
            },
          ],
        };
      }

      case "ghost_create_post": {
        const createParams = args as {
          title: string;
          html: string;
          slug?: string;
          status?: string;
          tags?: string[];
          published_at?: string;
        } | undefined;
        const newPost = await api.posts.add(
          {
            title: createParams?.title || "",
            html: createParams?.html || "",
            slug: createParams?.slug,
            status: createParams?.status || "draft",
            tags: createParams?.tags ? createParams.tags.map((name: string) => ({ name })) : undefined,
            published_at: createParams?.published_at,
          },
          { include: "tags,authors" }
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(newPost, null, 2),
            },
          ],
        };
      }

      case "ghost_update_post": {
        const updateParams = args as {
          id: string;
          updated_at: string;
          title?: string;
          html?: string;
          slug?: string;
          status?: string;
          tags?: string[];
          published_at?: string;
        } | undefined;
        const updatedPost = await api.posts.edit(
          {
            id: updateParams?.id || "",
            updated_at: updateParams?.updated_at || "",
            title: updateParams?.title,
            html: updateParams?.html,
            slug: updateParams?.slug,
            status: updateParams?.status,
            tags: updateParams?.tags ? updateParams.tags.map((name: string) => ({ name })) : undefined,
            published_at: updateParams?.published_at,
          },
          { include: "tags,authors" }
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(updatedPost, null, 2),
            },
          ],
        };
      }

      case "ghost_delete_post": {
        const deleteParams = args as { id: string } | undefined;
        await api.posts.delete({ id: deleteParams?.id || "" });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, id: deleteParams?.id }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * サーバーを起動
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Ghost Admin API MCP Server が起動しました");
}

main().catch((error) => {
  console.error("サーバーエラー:", error);
  process.exit(1);
});
