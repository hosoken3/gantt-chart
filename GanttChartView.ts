import { ItemView, WorkspaceLeaf } from 'obsidian';
import type GanttChartPlugin from './main';

export const VIEW_TYPE_GANTT = 'gantt-chart-view';

export class GanttChartView extends ItemView {
	plugin: GanttChartPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: GanttChartPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_GANTT;
	}

	getDisplayText(): string {
		return 'ガントチャート';
	}

	getIcon(): string {
		return 'calendar-glyph';
	}

	async onOpen() {
		const container = this.containerEl.children[1] as HTMLElement;
		container.empty();
		container.addClass('gantt-view-container');

		// ヘッダー
		this.createHeader(container);

		// タスク追加ボタン
		this.createAddTaskButton(container);

		// ガントチャートテーブル
		this.createGanttTable(container);
	}

	createHeader(container: HTMLElement) {
		const header = container.createDiv({ cls: 'gantt-header' });
		header.createEl('h4', { text: 'ガントチャート', cls: 'gantt-title' });
	}

	createAddTaskButton(container: HTMLElement) {
		const buttonContainer = container.createDiv({ cls: 'gantt-button-container' });
		const button = buttonContainer.createEl('button', {
			text: '+ 新しいタスク',
			cls: 'add-task-button'
		});

		button.addEventListener('click', () => {
			const today = new Date();
			const todayStr = this.formatDate(today);
			const nextWeek = new Date(today);
			nextWeek.setDate(nextWeek.getDate() + 7);
			const nextWeekStr = this.formatDate(nextWeek);

			this.plugin.settings.tasks.push({
				name: '新しいタスク',
				startDate: todayStr,
				endDate: nextWeekStr
			});

			this.plugin.saveSettings();
			this.refresh();
		});
	}

	createGanttTable(container: HTMLElement) {
		const wrapper = container.createDiv({ cls: 'gantt-table-wrapper' });
		const table = wrapper.createEl('table', { cls: 'gantt-table' });

		// ヘッダー
		const thead = table.createEl('thead');
		const headerRow = thead.createEl('tr');
		
		headerRow.createEl('th', { text: 'タスク名', cls: 'gantt-fixed-column' });
		headerRow.createEl('th', { text: '開始日', cls: 'gantt-fixed-column gantt-date-header' });
		headerRow.createEl('th', { text: '終了日', cls: 'gantt-fixed-column gantt-date-header' });
		headerRow.createEl('th', { text: '操作', cls: 'gantt-fixed-column gantt-action-header' });

		// カレンダーヘッダー
		this.addCalendarHeaders(headerRow);

		// タスク行
		const tbody = table.createEl('tbody');
		for (const task of this.plugin.settings.tasks) {
			this.createTaskRow(tbody as any, task);
		}
	}

	addCalendarHeaders(headerRow: HTMLTableRowElement) {
		const { startDate, endDate } = this.calculateDateRange();
		const dates = this.generateDateArray(startDate, endDate);

		// 月ヘッダー
		const monthRow = headerRow.parentElement?.createEl('tr', { cls: 'gantt-month-row' });
		if (monthRow) {
			monthRow.createEl('th', { cls: 'gantt-fixed-column' }); // タスク名
			monthRow.createEl('th', { cls: 'gantt-fixed-column' }); // 開始日
			monthRow.createEl('th', { cls: 'gantt-fixed-column' }); // 終了日
			monthRow.createEl('th', { cls: 'gantt-fixed-column' }); // 操作

			let currentMonth = -1;
			let monthColspan = 0;
			let monthCell: HTMLTableCellElement | null = null;

			for (let i = 0; i < dates.length; i++) {
				const date = dates[i];
				const month = date.getMonth();
				const year = date.getFullYear();

				if (month !== currentMonth || (i > 0 && dates[i - 1].getFullYear() !== year)) {
					if (monthCell) {
						monthCell.setAttribute('colspan', monthColspan.toString());
					}

					currentMonth = month;
					monthColspan = 1;
					monthCell = monthRow.createEl('th', {
						cls: 'gantt-month-header',
						text: `${year}/${String(month + 1).padStart(2, '0')}`
					});
				} else {
					monthColspan++;
				}
			}

			if (monthCell) {
				monthCell.setAttribute('colspan', monthColspan.toString());
			}
		}

		// 日付ヘッダー
		headerRow.createEl('th', { cls: 'gantt-spacer' }); // 月行の後にスペーサー

		const today = this.getToday();
		for (const date of dates) {
			const day = date.getDate();
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
			const isToday = date.getTime() === today.getTime();

			headerRow.createEl('th', {
				cls: `gantt-date-header ${isWeekend ? 'gantt-weekend' : ''} ${isToday ? 'gantt-today' : ''}`,
				text: day.toString()
			});
		}
	}

	createTaskRow(tbody: HTMLTableRowElement, task: any) {
		const row = tbody.createEl('tr', { cls: 'gantt-task-row' });

		// タスク名（編集可能）
		const nameCell = row.createEl('td', { cls: 'gantt-editable gantt-fixed-column' });
		nameCell.contentEditable = 'true';
		nameCell.textContent = task.name;
		nameCell.addEventListener('blur', () => {
			task.name = nameCell.textContent || '';
			this.plugin.saveSettings();
		});
		nameCell.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				nameCell.blur();
			}
		});

		// 開始日（編集可能）
		const startCell = row.createEl('td', { cls: 'gantt-editable gantt-date-cell gantt-fixed-column' });
		startCell.contentEditable = 'true';
		startCell.textContent = task.startDate;
		startCell.addEventListener('blur', () => {
			task.startDate = startCell.textContent || '';
			this.plugin.saveSettings();
			this.refresh();
		});
		startCell.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				startCell.blur();
			}
		});

		// 終了日（編集可能）
		const endCell = row.createEl('td', { cls: 'gantt-editable gantt-date-cell gantt-fixed-column' });
		endCell.contentEditable = 'true';
		endCell.textContent = task.endDate;
		endCell.addEventListener('blur', () => {
			task.endDate = endCell.textContent || '';
			this.plugin.saveSettings();
			this.refresh();
		});
		endCell.addEventListener('keydown', (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				endCell.blur();
			}
		});

		// 削除ボタン
		const actionCell = row.createEl('td', { cls: 'gantt-action-cell gantt-fixed-column' });
		const deleteBtn = actionCell.createEl('button', {
			text: '✕',
			cls: 'delete-task-button'
		});
		deleteBtn.addEventListener('click', () => {
			const index = this.plugin.settings.tasks.indexOf(task);
			if (index > -1) {
				this.plugin.settings.tasks.splice(index, 1);
				this.plugin.saveSettings();
				this.refresh();
			}
		});

		// ガントバーセル
		this.addGanttCells(row, task);
	}

	addGanttCells(row: HTMLTableRowElement, task: any) {
		const { startDate, endDate } = this.calculateDateRange();
		const dates = this.generateDateArray(startDate, endDate);
		const today = this.getToday();

		const taskStart = this.parseDate(task.startDate);
		const taskEnd = this.parseDate(task.endDate);

		if (!taskStart || !taskEnd) return;

		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
			const isMonthBoundary = date.getDate() === 1 && i > 0;
			const isToday = date.getTime() === today.getTime();

			const cell = row.createEl('td', {
				cls: `gantt-date-cell ${isWeekend ? 'gantt-weekend' : ''} ${isMonthBoundary ? 'gantt-month-boundary' : ''} ${isToday ? 'gantt-today' : ''}`
			});

			const dateTime = date.getTime();
			const taskStartTime = taskStart.getTime();
			const taskEndTime = taskEnd.getTime();

			if (dateTime >= taskStartTime && dateTime <= taskEndTime) {
				const isFirstDay = dateTime === taskStartTime;
				const isLastDay = dateTime === taskEndTime;

				cell.createEl('div', {
					cls: `gantt-bar ${isFirstDay ? 'gantt-bar-start' : ''} ${isLastDay ? 'gantt-bar-end' : ''}`
				});
			}
		}
	}

	calculateDateRange(): { startDate: Date; endDate: Date } {
		const today = this.getToday();

		if (this.plugin.settings.tasks.length === 0) {
			return { startDate: today, endDate: today };
		}

		const startDate = new Date(today);
		let maxDate = today;

		for (const task of this.plugin.settings.tasks) {
			const taskEnd = this.parseDate(task.endDate);
			if (taskEnd && taskEnd >= today && taskEnd > maxDate) {
				maxDate = taskEnd;
			}
		}

		const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
		return { startDate, endDate };
	}

	generateDateArray(startDate: Date, endDate: Date): Date[] {
		const dates: Date[] = [];
		const current = new Date(startDate);

		while (current <= endDate) {
			dates.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}

		return dates;
	}

	getToday(): Date {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	}

	parseDate(dateStr: string): Date | null {
		dateStr = dateStr.trim();
		const match = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
		if (match) {
			const year = parseInt(match[1]);
			const month = parseInt(match[2]) - 1;
			const day = parseInt(match[3]);
			const date = new Date(year, month, day);
			date.setHours(0, 0, 0, 0);
			return date;
		}
		return null;
	}

	formatDate(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}/${month}/${day}`;
	}

	refresh() {
		this.onOpen();
	}

	async onClose() {
		// Cleanup
	}
}
