
// Human Readable: 2023-06-06 04:52
function toHumanReadable(jiraFormatString: string): string {
	const regex = /(?<day>\d+)\/(?<month>\d+)월\/(?<year>\d+) (?<hour>\d+):(?<minute>\d+) 오(?<daynight>[후전])/;
	const match = regex.exec(jiraFormatString);

	if (match === null) {
		throw new Error('Failed to parse Jira formatted date string');
	}

	const {day, month, year, hour, minute, daynight} = match.groups as Record<string, string>;

	let hourInt = Number.parseInt(hour);
	const minuteInt = Number.parseInt(minute);

	if (daynight === '전') {
		// Nothing
	} else if (daynight === '후') {
		hourInt += 12;
	} else {
		throw new Error('Failed to parse Jira formatted date string (오전|오후)');
	}

	if (!(hourInt >= 0 && hourInt < 24)) {
		throw new Error(`Invalid hour: ${hourInt}. (0 <= hour < 24)`);
	}

	if (!(minuteInt >= 0 && minuteInt < 60)) {
		throw new Error(`Invalid minute: ${minuteInt}. (0 <= minute < 60)`);
	}

	let result = `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')} `;
	result += `${String(hourInt).padStart(2, '0')}:${String(minuteInt).padStart(2, '0')}`;

	return result;
}

// Human Readable: 2023-06-06 04:52
// Jira Format: 6/6월/23 04:52 오후
function toJiraFormat(humanReadable: string): string {
	const regex = /^ *(?<yearStr>\d{4})-(?<monthStr>\d{1,2})-(?<dateStr>\d{1,2}) (?<hourStr>\d{1,2}):(?<minuteStr>\d{1,2}) *$/;
	const match = regex.exec(humanReadable);

	if (match === null) {
		throw 'Invalid datetime format';
	}

	const {yearStr, monthStr, dateStr, hourStr, minuteStr} = match.groups!;

	const date = Number.parseInt(dateStr);
	if (date < 1 || date > 31) {
		throw 'Invalid date (1 <= date <= 31)';
	}

	const month = Number.parseInt(monthStr);
	if (month < 1 || month > 12) {
		throw 'Invalid month (1 <= month <= 12)';
	}

	const year = Number.parseInt(yearStr);
	if (year < 2000 || year > 2099) {
		throw 'Invalid year (2000 <= year <= 2099)';
	}

	const hour = Number.parseInt(hourStr);
	if (hour < 0 || hour > 23) {
		throw 'Invalid hour (0 <= hour <= 23)';
	}

	const minute = Number.parseInt(minuteStr);
	if (minute < 0 || minute > 59) {
		throw 'Invalid minute (0 <= minute <= 59)';
	}

	return `${date}/${month}월/${year - 2000} ${String(hour - 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${hour < 12 ? '오전' : '오후'}`;
}

const dateConverter = {
	toHumanReadable,
	toJiraFormat,
};
export default dateConverter;
