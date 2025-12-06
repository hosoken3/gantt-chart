import { Plugin, MarkdownPostProcessorContext } from 'obsidian';

interface GanttTask {
	name: string;
	startDate: Date;
	endDate: Date;
}

export default class GanttChartPlugin extends Plugin {
	async onload() {
		console.log('Loading Gantt Chart Plugin');

		// Register markdown code block processor for 'gantt'
		this.registerMarkdownCodeBlockProcessor('gantt', (source, el, ctx) => {
			this.renderGanttChart(source, el, ctx);
		});
	}

	onunload() {
		console.log('Unloading Gantt Chart Plugin');
	}

	/**
	 * Parse gantt data from source text
	 * Format: タスク名 | 開始日 | 終了日
	 * Date format: YYYY/MM/DD or YYYY-MM-DD
	 */
	parseGanttData(source: string): GanttTask[] {
		const tasks: GanttTask[] = [];
		const lines = source.trim().split('\n');

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine || trimmedLine.startsWith('#')) continue;

			const parts = trimmedLine.split('|').map(p => p.trim());
			if (parts.length !== 3) continue;

			const [name, startDateStr, endDateStr] = parts;
			
			// Parse dates (support both YYYY/MM/DD and YYYY-MM-DD)
			const startDate = this.parseDate(startDateStr);
			const endDate = this.parseDate(endDateStr);

			if (startDate && endDate) {
				tasks.push({ name, startDate, endDate });
			}
		}

		return tasks;
	}

	/**
	 * Parse date string in various formats
	 */
	parseDate(dateStr: string): Date | null {
		// Remove whitespace
		dateStr = dateStr.trim();
		
		// Try YYYY/MM/DD or YYYY-MM-DD format
		const match = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
		if (match) {
			const year = parseInt(match[1]);
			const month = parseInt(match[2]) - 1; // JS months are 0-indexed
			const day = parseInt(match[3]);
			return new Date(year, month, day);
		}

		return null;
	}

	/**
	 * Calculate the date range for the gantt chart
	 */
	calculateDateRange(tasks: GanttTask[]): { startDate: Date; endDate: Date } {
		if (tasks.length === 0) {
			const today = new Date();
			return { startDate: today, endDate: today };
		}

		let minDate = tasks[0].startDate;
		let maxDate = tasks[0].endDate;

		for (const task of tasks) {
			if (task.startDate < minDate) minDate = task.startDate;
			if (task.endDate > maxDate) maxDate = task.endDate;
		}

		// Add some padding (start from beginning of month, end at end of month)
		const startDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
		const endDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

		return { startDate, endDate };
	}

	/**
	 * Generate array of dates between start and end
	 */
	generateDateArray(startDate: Date, endDate: Date): Date[] {
		const dates: Date[] = [];
		const current = new Date(startDate);

		while (current <= endDate) {
			dates.push(new Date(current));
			current.setDate(current.getDate() + 1);
		}

		return dates;
	}

	/**
	 * Render the gantt chart
	 */
	renderGanttChart(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
		const tasks = this.parseGanttData(source);

		if (tasks.length === 0) {
			el.createEl('div', { 
				text: 'ガントチャートにタスクがありません。形式: タスク名 | 開始日 | 終了日',
				cls: 'gantt-error'
			});
			return;
		}

		const { startDate, endDate } = this.calculateDateRange(tasks);
		const dates = this.generateDateArray(startDate, endDate);

		// Create container
		const container = el.createEl('div', { cls: 'gantt-chart-container' });

		// Create table
		const table = container.createEl('table', { cls: 'gantt-chart-table' });

		// Render header
		this.renderHeader(table, dates);

		// Render task rows
		this.renderTaskRows(table, tasks, dates, startDate);
	}

	/**
	 * Render calendar header
	 */
	renderHeader(table: HTMLTableElement, dates: Date[]) {
		const thead = table.createEl('thead');

		// Month row
		const monthRow = thead.createEl('tr', { cls: 'gantt-month-row' });
		monthRow.createEl('th', { cls: 'gantt-task-header', text: 'タスク' });

		let currentMonth = -1;
		let monthColspan = 0;
		let monthCell: HTMLTableCellElement | null = null;

		for (let i = 0; i < dates.length; i++) {
			const date = dates[i];
			const month = date.getMonth();

			if (month !== currentMonth) {
				if (monthCell) {
					monthCell.setAttribute('colspan', monthColspan.toString());
				}

				currentMonth = month;
				monthColspan = 1;
				monthCell = monthRow.createEl('th', {
					cls: 'gantt-month-header',
					text: `${date.getFullYear()}/${String(month + 1).padStart(2, '0')}`
				});
			} else {
				monthColspan++;
			}
		}

		// Set final month colspan
		if (monthCell) {
			monthCell.setAttribute('colspan', monthColspan.toString());
		}

		// Date row
		const dateRow = thead.createEl('tr', { cls: 'gantt-date-row' });
		dateRow.createEl('th', { cls: 'gantt-task-header-date' }); // Empty cell for task column

		for (const date of dates) {
			const day = date.getDate();
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

			dateRow.createEl('th', {
				cls: `gantt-date-header ${isWeekend ? 'gantt-weekend' : ''}`,
				text: day.toString()
			});
		}
	}

	/**
	 * Render task rows with gantt bars
	 */
	renderTaskRows(table: HTMLTableElement, tasks: GanttTask[], dates: Date[], chartStartDate: Date) {
		const tbody = table.createEl('tbody');

		for (const task of tasks) {
			const row = tbody.createEl('tr', { cls: 'gantt-task-row' });

			// Task name cell
			row.createEl('td', { cls: 'gantt-task-name', text: task.name });

			// Date cells with gantt bar
			for (let i = 0; i < dates.length; i++) {
				const date = dates[i];
				const dayOfWeek = date.getDay();
				const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
				const isMonthBoundary = date.getDate() === 1 && i > 0;

				const cell = row.createEl('td', {
					cls: `gantt-date-cell ${isWeekend ? 'gantt-weekend' : ''} ${isMonthBoundary ? 'gantt-month-boundary' : ''}`
				});

				// Check if this date is within the task's date range
				const dateTime = date.getTime();
				const taskStartTime = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate()).getTime();
				const taskEndTime = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate()).getTime();

				if (dateTime >= taskStartTime && dateTime <= taskEndTime) {
					const isFirstDay = dateTime === taskStartTime;
					const isLastDay = dateTime === taskEndTime;

					cell.createEl('div', {
						cls: `gantt-bar ${isFirstDay ? 'gantt-bar-start' : ''} ${isLastDay ? 'gantt-bar-end' : ''}`
					});
				}
			}
		}
	}
}
