import React from 'dom-chef';

import features from '../../helpers/feature-manager.js';
import pageDetect from '../../helpers/page-detect.js';
import observe from '../../helpers/selector-observer.js';
import dateConverter from '../../helpers/jira-date-converter.js';

function add(input: HTMLInputElement): void {
	input.style.pointerEvents = 'none';
	input.style.opacity = '50%';
	input.style.marginLeft = '8px';

	const parentElement = input.parentElement!;

	// Error display
	const errorDisplay = <span color="var(--ds-icon-danger)"/>;
	parentElement.querySelector('label')!.append(errorDisplay);

	// Remove calendar icon
	parentElement.querySelector('span.ghx-iconfont')!.style.display = 'none';

	// Initialize
	const newInput = <input className="text medium-field" type="text"/>;
	if (!(newInput instanceof HTMLInputElement)) {
		return;
	}
	newInput.value = dateConverter.toHumanReadable(input.value);

	newInput.addEventListener('change', () => {
		try {
			input.value = dateConverter.toJiraFormat(newInput.value);
			errorDisplay.textContent = '';
		} catch (error) {
			errorDisplay.textContent = typeof error === 'string' ? error : 'Unknown error occurred';
		}
	});

	input.before(newInput);
}

function init(signal: AbortSignal): void {
	observe('input#ghx-sprint-start-date', add, {signal});
	observe('input#ghx-sprint-end-date', add, {signal});
}

void features.add(
	import.meta.url, {
		init,
		include: [pageDetect.always],
	},
);
