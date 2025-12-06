# Obsidian Gantt Chart Plugin

美しいガントチャートをObsidianで表示するプラグインです。タスク名、開始日、終了日を指定するだけで、プロフェッショナルなガントチャートが自動生成されます。

![Gantt Chart Example](https://raw.githubusercontent.com/yourusername/obsidian-gantt-chart/main/screenshot.png)

## ✨ Features

- 📋 シンプルな記法でガントチャートを作成
- 📅 開始日・終了日の自動反映
- 🎨 美しい日本語対応UI
- 🌈 週末・月の境界を視覚的に区別
- 🌓 ライト/ダークモード対応
- 📱 レスポンシブデザイン
- ⚡ 高速レンダリング

## 📝 Usage

Markdownノートで以下のように記述します：

~~~markdown
```gantt
基本設計 | 2010/05/12 | 2010/05/21
詳細設計A | 2010/05/12 | 2010/05/26
詳細設計B | 2010/05/17 | 2010/05/18
詳細設計C | 2010/05/19 | 2010/05/21
総合計画 | 2010/05/24 | 2010/06/02
```
~~~

### 記法

- **フォーマット**: `タスク名 | 開始日 | 終了日`
- **日付形式**: `YYYY/MM/DD` または `YYYY-MM-DD`
- **コメント**: `#` で始まる行は無視されます

### サンプル

~~~markdown
```gantt
# プロジェクト例
プロジェクト計画 | 2025/01/01 | 2025/01/15
要件定義 | 2025/01/10 | 2025/01/25
基本設計 | 2025/01/20 | 2025/02/10
詳細設計 | 2025/02/05 | 2025/02/28
実装フェーズ1 | 2025/02/20 | 2025/03/15
実装フェーズ2 | 2025/03/10 | 2025/04/05
テスト | 2025/03/25 | 2025/04/20
リリース準備 | 2025/04/15 | 2025/04/30
```
~~~

## 🚀 Installation

### From Obsidian Community Plugins

1. Obsidianを開く
2. Settings → Community plugins → Browse
3. "Gantt Chart" を検索
4. Install → Enable

### Manual Installation

1. 最新リリースから `main.js`, `manifest.json`, `styles.css` をダウンロード
2. Obsidianの vault フォルダ内の `.obsidian/plugins/gantt-chart/` にコピー
3. Obsidianを再起動
4. Settings → Community plugins で "Gantt Chart" を有効化

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

## 🎨 Customization

CSSをカスタマイズしてガントバーの色やスタイルを変更できます：

```css
/* カスタムガントバーの色 */
.gantt-bar {
	background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

## 📄 License

MIT License

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 💬 Support

Issues や質問は [GitHub Issues](https://github.com/yourusername/obsidian-gantt-chart/issues) でお願いします。

---

Made with ❤️ for the Obsidian community
