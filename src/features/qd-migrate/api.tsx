import React from 'dom-chef';

import {confirmToast, showToast} from './toast.js';

export default async function createIssue(): Promise<void> {
	const url = new URL(location.href);
	const selectedIssue = url.searchParams.get('selectedIssue');

	if (selectedIssue === null) {
		throw new Error('Cannot find selected Issue');
	}

	if (!await confirmToast(`"${selectedIssue}" will be forked to QD.\nAre you sure to make it?`)) {
		return;
	}

	await showToast(async message => {
		message('Forking.. (1/3)');
		const issue = await getIssue(url, selectedIssue);

		message('Forking.. (2/3)');
		const {key: createdIssue}: Record<string, string> = await createIssueCore(url, issue);

		message('Forking.. (3/3)');
		await editIssue(url, selectedIssue, createdIssue);

		message(<span>Forked: <a href={`/browse/${createdIssue}`} target="_blank" rel="noreferrer">{createdIssue}</a></span>);
	}, {
		message: 'Forking..',
	});
}

async function editIssue(url: URL, selectedIssue: string, createdIssue: string): Promise<void> {
	await fetch(`${url.origin}/rest/api/2/issueLink`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			inwardIssue: {
				key: selectedIssue,
			},
			outwardIssue: {
				key: createdIssue,
			},
			type: {
				id: '10300',
			},
		}),
	});
}

async function createIssueCore(url: URL, issue: any): Promise<any> {
	const createResponse = await fetch(`${url.origin}/rest/api/2/issue`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			fields: {
				project: {
					key: 'QD',
				},
				...issue.fields,
			},
		}),
	});

	return createResponse.json();
}

async function getIssue(url: URL, selectedIssue: string): Promise<any> {
	const issueResponse = await fetch(`${url.origin}/rest/api/2/issue/${selectedIssue}`);
	const {
		fields: {
			issuetype,
			assignee,
			summary,
		},
	} = await 	issueResponse.json();

	return {
		fields: {
			issuetype: {name: issuetype.name},
			assignee: {accountId: assignee.accountId},
			summary,
		},
	};
}
