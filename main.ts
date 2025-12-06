import { Plugin, MarkdownView } from 'obsidian';

interface GanttTask {
	name: string;
	startDate: Date;
	endDate: Date;
}

export default class GanttChartPlugin extends Plugin {
	async onload() {
		console.log('Loading Gantt Chart Plugin');

		// Register markdown post processor to detect gantt frontmatter
		this.registerMarkdownPostProcessor((el, ctx) => {
			const info = ctx.getSectionInfo(el);
			if (!info) return;

			// Get the file
			const abstractFile = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
			if (!abstractFile) return;

			// Check if it's actually a file (not a folder)
			if (!('extension' in abstractFile)) return;
			const file = abstractFile as any; // TFile type

			// Read the file to check frontmatter
			this.app.vault.read(file).then((content) => {
				// Check if frontmatter has gantt: true
				const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
				if (!frontmatterMatch) return;

				const frontmatter = frontmatterMatch[1];
				if (!frontmatter.includes('gantt: true') && !frontmatter.includes('gantt:true')) return;

				// Extract content after frontmatter
				const ganttContent = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();

				// Clear the element and render gantt chart
				el.empty();
				this.renderGanttChart(ganttContent, el, ctx);
			});
		});
	}

	onunload() {
		console.log('Unloading Gantt Chart Plugin');
	}

	/**
	 * Get today's date at midnight
	 */
	getToday(): Date {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		return today;
	}

	/**
	 * Parse gantt data from source text
	 * Format: タスク名 | 開始日 | 終了日
	 * Date format: YYYY/MM/DD or YYYY-MM-DD
	 */
	parseGanttData(source: string): GanttTask[] {
		const tasks: GanttTask[] = [];
		const lines = source.trim().split('\n');
		const today = this.getToday();

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
				// Only include tasks that end today or in the future
				if (endDate >= today) {
					tasks.push({ name, startDate, endDate });
				}
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
			const date = new Date(year, month, day);
			date.setHours(0, 0, 0, 0);
			return date;
		}

		return null;
	}

	/**
	 * Calculate the date range for the gantt chart
	 * Always starts from today
	 */
	calculateDateRange(tasks: GanttTask[]): { startDate: Date; endDate: Date } {
		const today = this.getToday();

		if (tasks.length === 0) {
			return { startDate: today, endDate: today };
		}

		// Start from today
		const startDate = new Date(today);

		// Find the maximum end date
		let maxDate = tasks[0].endDate;
		for (const task of tasks) {
			if (task.endDate > maxDate) maxDate = task.endDate;
		}

		// End at the end of the month of the last task
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
	renderGanttChart(source: string, el: HTMLElement, ctx: any) {
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
		const container = el.createEl('div', { cls: 'gantt-chart-container gantt-chart-fullpage' });

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
			const year = date.getFullYear();

			if (month !== currentMonth || (i > 0 && dates[i-1].getFullYear() !== year)) {
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

		// Set final month colspan
		if (monthCell) {
			monthCell.setAttribute('colspan', monthColspan.toString());
		}

		// Date row
		const dateRow = thead.createEl('tr', { cls: 'gantt-date-row' });
		dateRow.createEl('th', { cls: 'gantt-task-header-date' }); // Empty cell for task column

		const today = this.getToday();

		for (const date of dates) {
			const day = date.getDate();
			const dayOfWeek = date.getDay();
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
			const isToday = date.getTime() === today.getTime();

			dateRow.createEl('th', {
				cls: `gantt-date-header ${isWeekend ? 'gantt-weekend' : ''} ${isToday ? 'gantt-today' : ''}`,
				text: day.toString()
			});
		}
	}

	/**
	 * Render task rows with gantt bars
	 */
	renderTaskRows(table: HTMLTableElement, tasks: GanttTask[], dates: Date[], chartStartDate: Date) {
		const tbody = table.createEl('tbody');
		const today = this.getToday();

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
				const isToday = date.getTime() === today.getTime();

				const cell = row.createEl('td', {
					cls: `gantt-date-cell ${isWeekend ? 'gantt-weekend' : ''} ${isMonthBoundary ? 'gantt-month-boundary' : ''} ${isToday ? 'gantt-today' : ''}`
				});

				// Check if this date is within the task's date range
				const dateTime = date.getTime();
				const taskStartTime = task.startDate.getTime();
				const taskEndTime = task.endDate.getTime();

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
