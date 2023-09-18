import features from "../../helpers/feature-manager";
import pageDetect from "../../helpers/page-detect";
import observe from "../../helpers/selector-observer";
import select from "select-dom";
import {fetchJSON} from "../../helpers/fetch-util";

type IssueStatus = 'new' | 'done' | 'indeterminate'
async function getIssueStatus(issueKey: String): Promise<IssueStatus> {
	const data = await fetchJSON(`/rest/api/3/issue/${issueKey}`)
	return data.fields.status.statusCategory.key
}

async function add(issueRow: HTMLDivElement) {
	const issueKey = issueRow.getAttribute('data-issue-key')!
	const issueStatus = await getIssueStatus(issueKey)

	switch (issueStatus) {
		case "indeterminate":
			select('.ghx-statistic-badge', issueRow)!.classList.add('ghx-in-progress')
			issueRow.parentElement!.prepend(issueRow)
			return
		case "done":
			issueRow.style.opacity = '50%'
			select('.ghx-statistic-badge', issueRow)!.classList.add('ghx-done')
			issueRow.parentElement!.append(issueRow)
			return
	}
}

function init(signal: AbortSignal): void {
	observe('.js-issue', add, {signal})
}

void features.add(
	import.meta.url, {
		init,
		include: [pageDetect.isBacklogPage],
	},
);
