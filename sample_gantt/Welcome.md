# Gantt Chart Plugin - 動作確認完了 ✅

このvaultはGantt Chartプラグインの動作確認用です。

## 📦 インストール済み

プラグインは正しくインストールされています：

```
sample_gantt/
└── .obsidian/
    └── plugins/
        └── gantt-chart/     ✅ フォルダ名正しい
            ├── main.js      ✅
            ├── manifest.json ✅
            └── styles.css   ✅
```

## 📝 サンプルノート

以下のサンプルノートで動作確認できます：

1. **[[ガントチャート サンプル]]** - プロジェクト管理の例
2. **[[テスト用]]** - シンプルなテスト

## 🚀 使い方

1. Obsidianを起動
2. Settings (⚙️) → Community plugins
3. Restricted mode を OFF
4. "Gantt Chart" プラグインを ON
5. サンプルノートを開いて読み取りモードで確認

## ✨ 記法

```markdown
---
gantt: true
---

タスク名 | 開始日 | 終了日
```

日付形式: `YYYY/MM/DD` または `YYYY-MM-DD`

---

**今日以降のタスクだけが表示されます！** 📅