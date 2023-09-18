import features from '../../helpers/feature-manager.js';
import pageDetect from '../../helpers/page-detect.js';
import observe from '../../helpers/selector-observer';

function dim(fields: HTMLDivElement): void {
	const spans = [...fields.querySelectorAll('span.ghx-extra-field>span')];

	if (spans[0].textContent!.trim() !== '해야 할 일') {
		return;
	}

	if (spans[1].textContent!.trim().toUpperCase() !== 'MONITORING') {
		return;
	}

	fields.style.display = 'none';
	fields.closest('div.ghx-backlog-card')!.style.opacity = '50%';
}

function init(signal: AbortSignal): void {
	observe('div.js-issue.ghx-backlog-card>div.ghx-issue-content div.ghx-plan-extra-fields', dim, {signal});
}

void features.add(
	import.meta.url,
	{
		init,
		include: [pageDetect.always],
	},
);
