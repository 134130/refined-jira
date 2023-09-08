import React from 'react';

import select from 'select-dom';

import delegate from 'delegate-it';

import createIssue from './api.js';
import features from '../../helpers/feature-manager.js';
import observe from '../../helpers/selector-observer.js';
import pageDetect from '../../helpers/page-detect.js';

const controllers = new Map<string, AbortController>();

function createButton(title: string, wannabe: HTMLButtonElement): React.JSX.Element {
	return (
		<button role="menuitem" type="button" className={wannabe.classList[wannabe.classList.length - 1]} onClick={async () => createIssue()}>
			<span className={wannabe.firstElementChild!.className}>
				<span className={wannabe.firstElementChild!.firstElementChild!.className}>
					<span
						data-item-title="true"
						className={wannabe.firstElementChild!.firstElementChild!.firstElementChild!.className}
					>
						{title}
					</span>
				</span>
			</span>
		</button>
	);
}

async function add(menuElement: HTMLElement): Promise<void> {
	const searchParameters = new URL(location.href).searchParams;
	const selectedIssue = searchParameters.get('selectedIssue');

	if (selectedIssue === null) {
		return;
	}

	const menuGroups = select.all('div[role="group"]', menuElement);
	const menuGroup = menuGroups[1];

	const wannabe = menuGroup.firstElementChild as HTMLDivElement;
	const button = createButton(`QD에 복제 (${selectedIssue})`, wannabe.firstElementChild as HTMLButtonElement);

	menuGroup.append(<div className="jira-extension-qd-migrate">{button}</div>);
}

async function init(): Promise<void> {
	document.addEventListener('JiraAgile.selectedIssuesChanged', async evt => {
		const event = evt as any;
		const issues = event.detail.selectedIssues as string[];

		if (issues.length === 0) {
			return;
		}

		for (const item of controllers) {
			const [id, controller] = item;
			controller.abort(`Abort since new issue has detected. (old: ${id}, new: ${issues[0]})`);
		}

		controllers.clear();

		const abort = new AbortController();
		const signal = abort.signal;

		delegate('button[data-testid="issue-meatball-menu.ui.dropdown-trigger.button"]', 'click', () => {
			observe('.atlaskit-portal>div>div[data-testid="issue.issue-meatball-menu.content"]',
				add,
				{signal},
			);
		}, {signal});
		controllers.set(issues[0], abort);
	});
}

void features.add(import.meta.url, {
	init,
	include: [
		pageDetect.always,
	],
});
