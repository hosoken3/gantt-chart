# Obsidian Gantt Chart Plugin

美しいガントチャートをObsidianで表示するプラグインです。ページ全体をプロジェクト管理画面に変換できます。

---

## 📋 目次

1. [インストール方法](#-インストール方法初心者向け)
2. [使い方](#-使い方初心者向け)
3. [機能](#-features)
4. [トラブルシューティング](#-トラブルシューティング)
5. [開発者向け](#️-development)

---

## 🚀 インストール方法（初心者向け）

### 必要なファイル

以下の**3つのファイル**が必要です：

- ✅ `main.js` - プラグインの本体
- ✅ `manifest.json` - プラグイン情報
- ✅ `styles.css` - デザイン

### ステップ1: ビルドする

まず、このプラグインをビルドしてファイルを生成します：

```bash
# 1. 依存関係をインストール
npm install

# 2. ビルド実行
npm run build
```

ビルドが成功すると、`main.js` が生成されます。`manifest.json` と `styles.css` は既に存在します。

### ステップ2: フォルダ構造を確認

Obsidianのvault（ノートを保存しているフォルダ）の中に、以下のような構造でファイルを配置します：

```
あなたのVault/
└── .obsidian/
    └── plugins/
        └── gantt-chart/    ← このフォルダを作成
            ├── main.js
            ├── manifest.json
            └── styles.css
```

![フォルダ構造](C:/Users/ken5h/.gemini/antigravity/brain/6c505903-808c-4bbb-b345-d4f618db100e/folder_structure_1765040731870.png)

### ステップ3: フォルダを作成してファイルをコピー

#### Windowsの場合：

1. **Vaultフォルダを開く**
   - Obsidianで Settings (⚙️) → Files & Links → "Vault folder" の横の📁アイコンをクリック

2. **プラグインフォルダに移動**
   - `.obsidian` フォルダを開く（隠しフォルダなので見えない場合は、エクスプローラーで「表示」→「隠しファイル」をONに）
   - `plugins` フォルダを開く

3. **新しいフォルダを作成**
   - `plugins` フォルダの中に `gantt-chart` という名前の新しいフォルダを作成

4. **ファイルをコピー**
   - ダウンロードした以下の3つのファイルを `gantt-chart` フォルダにコピー：
     - `main.js`
     - `manifest.json`
     - `styles.css`

### ステップ4: Obsidianでプラグインを有効化

1. **Obsidianを再起動**

2. **Settings を開く**
   - 左下の⚙️アイコンをクリック

3. **Community plugins に移動**
   - 左サイドバーから「Community plugins」を選択

4. **Restricted mode をOFFにする**（まだの場合）
   - 「Restricted mode」のトグルをOFFにする
   - 警告が出たら「Turn off Restricted mode」をクリック

5. **Gantt Chart プラグインを有効化**
   - 「Installed plugins」セクションに「Gantt Chart」が表示されているはず
   - トグルスイッチをONにする

![プラグイン設定画面](C:/Users/ken5h/.gemini/antigravity/brain/6c505903-808c-4bbb-b345-d4f618db100e/plugin_settings_1765040750949.png)

---

## 📝 使い方（初心者向け）

### 基本的な使い方

#### ステップ1: 新しいノートを作成

Obsidianで新しいノートを作成します（例: `プロジェクト管理.md`）

#### ステップ2: Frontmatter を追加

ノートの**一番上**に以下を記述します：

```markdown
---
gantt: true
---
```

> **重要**: `---` で囲まれた部分をFrontmatter（フロントマター）と呼びます。これは必ず**ノートの最初の行**に書いてください。

#### ステップ3: タスクを追加

Frontmatterの下に、タスクを以下の形式で書きます：

```
タスク名 | 開始日 | 終了日
```

**日付形式**: `YYYY/MM/DD` または `YYYY-MM-DD`

#### 完全な例：

```markdown
---
gantt: true
---

# 私のプロジェクト

プロジェクト計画 | 2025/12/07 | 2025/12/15
要件定義 | 2025/12/10 | 2025/12/25
基本設計 | 2025/12/20 | 2026/01/10
詳細設計 | 2026/01/05 | 2026/01/28
実装フェーズ1 | 2026/01/20 | 2026/02/15
テスト | 2026/02/25 | 2026/03/20
リリース | 2026/03/15 | 2026/03/30
```

#### ステップ4: プレビューで確認

- **読み取りモード**（プレビュー）に切り替えると、ガントチャートが表示されます！
- ページ全体がプロジェクト管理画面になります

![使用例](C:/Users/ken5h/.gemini/antigravity/brain/6c505903-808c-4bbb-b345-d4f618db100e/usage_example_1765040768836.png)

---

## ✨ Features

- 📄 **ページ全体をガントチャートに変換**
- 📅 **今日以降の日付のみ表示**（過去は自動除外）
- 📅 開始日・終了日の自動反映
- 🎨 美しい日本語対応UI
- 🌟 今日の列を特別にハイライト
- 🌈 週末・月の境界を視覚的に区別
- 🌓 ライト/ダークモード対応
- 📱 レスポンシブデザイン
- ⚡ 高速レンダリング

---

## 🔧 トラブルシューティング

### Q1: プラグインが「Installed plugins」に表示されない

**確認事項：**

1. **ファイルが正しい場所にあるか確認**
   ```
   あなたのVault/.obsidian/plugins/gantt-chart/
   ├── main.js          ← 必須
   ├── manifest.json    ← 必須
   └── styles.css       ← 必須
   ```

2. **フォルダ名が正しいか確認**
   - フォルダ名は `gantt-chart`（ハイフン入り）

3. **Obsidianを完全に再起動**
   - Obsidianを終了して、もう一度開き直す

4. **Restricted mode がOFFになっているか確認**
   - Settings → Community plugins → Restricted mode を OFF

### Q2: ガントチャートが表示されない

**確認事項：**

1. **Frontmatter が正しいか**
   ```markdown
   ---
   gantt: true
   ---
   ```
   - `gantt: true` のスペースや大文字小文字に注意
   - `---` は必ず3つのハイフン

2. **読み取りモード（プレビュー）になっているか**
   - 編集モードではなく、読み取りモードで表示

3. **タスクの形式が正しいか**
   ```
   タスク名 | 開始日 | 終了日
   ```
   - `|`（パイプ）で区切る
   - 日付は `YYYY/MM/DD` または `YYYY-MM-DD` 形式

### Q3: 過去のタスクが表示されない

これは**正常な動作**です。このプラグインは今日以降のタスクのみを表示します。

- 終了日が今日より前のタスクは自動的に非表示になります
- これにより、常に「今」と「未来」に集中できます

---

## 🛠️ Development

### Prerequisites

- Node.js (v16 or higher)
- npm

### Build

```bash
# 依存関係のインストール
npm install

# 開発モード（自動再ビルド）
npm run dev

# 本番ビルド
npm run build
```

### Testing

1. ビルド後、`main.js`, `manifest.json`, `styles.css` が生成されます
2. これらを Obsidian の vault の `.obsidian/plugins/gantt-chart/` にコピー
3. Obsidianを再起動またはプラグインをリロード

---

## 🎨 Customization

CSSをカスタマイズしてガントバーの色やスタイルを変更できます：

```css
/* カスタムガントバーの色 */
.gantt-bar {
	background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

---

## 📄 License

MIT License

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 💬 Support

Issues や質問は [GitHub Issues](https://github.com/yourusername/obsidian-gantt-chart/issues) でお願いします。

---

Made with ❤️ for the Obsidian community
