import observe from "../../helpers/selector-observer";
import React from "dom-chef";
import features from "../../helpers/feature-manager";
import pageDetect from "../../helpers/page-detect";
import select from "select-dom";
import {parseDOM} from "../../helpers/parse-dom";
import {GitBranchIcon, GitMergeIcon, GitPullRequestIcon} from "@primer/octicons-react";

type PrState = 'OPEN' | 'MERGED'

type IssueDevDetails = {
	prCount: number, prState: PrState, branchCount: number
}

async function getIssueDevDetails(issueKey: String): Promise<IssueDevDetails> {
	const response = await fetch(`/rest/greenhopper/1.0/xboard/issue/details.json?rapidViewId=100&issueIdOrKey=${issueKey}`)
	const data = await response.json()

	const tabs  = data.tabs.defaultTabs as any[]
	const thirdPartyTabSections = tabs.find(tab => tab.tabId == 'THIRD_PARTY_TAB').sections as any[]
	const plainHtml = thirdPartyTabSections.find(section => section.label == '개발').html
	const jsonData = select('.dev-summary.json-blob', parseDOM(plainHtml))!.getAttribute('data-json')!
	const parsedJson = JSON.parse(jsonData)
	const {pullrequest, branch} = parsedJson.cachedValue.summary

	return {
		prCount: pullrequest.overall.count,
		prState: pullrequest.overall.state,
		branchCount: branch.overall.count
	}
}

async function add(issueRow: HTMLDivElement) {
	// issueRow.getAttribute('data-issue-id')
	const issueKey = issueRow.getAttribute('data-issue-key')

	if (!issueKey) {
		return
	}

	const tagContainer = select('.ghx-items-container', issueRow)!
	const details = await getIssueDevDetails(issueKey)

	if (details.prCount > 0) {
		switch (details.prState) {
			case "OPEN":
				tagContainer.prepend(
					<span className='aui-lozenge ghx-label ghx-label-single ghx-purple'>
						<GitPullRequestIcon/> {details.prCount}
					</span>
				)
				break
			case "MERGED":
				tagContainer.prepend(
					<span className='aui-lozenge ghx-label ghx-label-single ghx-green'>
						<GitMergeIcon/> {details.prCount}
					</span>
				)
				break
			default:
				console.error(details.prState)
				break
		}


	}

	if (details.branchCount) {
		tagContainer.prepend(
			<span className='aui-lozenge ghx-label ghx-label-single ghx-blue'>
				<GitBranchIcon/> {details.branchCount}
			</span>
		)
	}
}

function init(): void {
	observe('.js-issue', add)
}

void features.add(
	import.meta.url, {
		init,
		include: [pageDetect.isBacklogPage],
	},
);
