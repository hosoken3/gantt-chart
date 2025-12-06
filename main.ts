import { Plugin, WorkspaceLeaf } from 'obsidian';
import { GanttChartView, VIEW_TYPE_GANTT } from './GanttChartView';

interface GanttTask {
	name: string;
	startDate: string;
	endDate: string;
}

interface GanttSettings {
	tasks: GanttTask[];
}

const DEFAULT_SETTINGS: GanttSettings = {
	tasks: [
		{
			name: 'タスク1',
			startDate: '2025/12/07',
			endDate: '2025/12/10'
		},
		{
			name: 'タスク2',
			startDate: '2025/12/09',
			endDate: '2025/12/15'
		},
		{
			name: 'タスク3',
			startDate: '2025/12/13',
			endDate: '2025/12/20'
		}
	]
};

export default class GanttChartPlugin extends Plugin {
	settings: GanttSettings;

	async onload() {
		await this.loadSettings();

		// ビュータイプ登録
		this.registerView(
			VIEW_TYPE_GANTT,
			(leaf) => new GanttChartView(leaf, this)
		);

		// リボンアイコン追加
		this.addRibbonIcon('calendar-glyph', 'ガントチャート', () => {
			this.activateView();
		});

		// コマンド追加（オプション）
		this.addCommand({
			id: 'open-gantt-chart',
			name: 'ガントチャートを開く',
			callback: () => {
				this.activateView();
			}
		});
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_GANTT);

		if (leaves.length > 0) {
			// 既存のビューがあればそれを表示
			leaf = leaves[0];
		} else {
			// 新しいビューを作成
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({
					type: VIEW_TYPE_GANTT,
					active: true,
				});
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		// Cleanup
	}
}
