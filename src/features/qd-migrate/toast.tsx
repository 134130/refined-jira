import delay from 'delay';
import {CheckCircleFillIcon, FeedForkedIcon, XCircleFillIcon, XIcon} from '@primer/octicons-react';
import React from 'react';
import select from 'select-dom';

import getDataColorMode from '../../helpers/color-mode-detect.js';

type ProgressCallback = (message: string | React.JSX.Element) => void;
type Task = Promise<unknown> | ((progress: ProgressCallback) => Promise<unknown>);

const toastContainer = <div id="jira-extension-toast-container" className="flex-column"/>;
function initToastContainer(): void {
	if (select('#jira-extension-toast-container') === undefined) {
		document.body.append(toastContainer);
	}
}

function successIcon(): JSX.Element {
	return <CheckCircleFillIcon size={24} color="var(--ds-background-success-bold)"/>;
}

function errorIcon(): JSX.Element {
	return <XCircleFillIcon size={24} color="var(--ds-background-danger-bold)"/>;
}

function forkingIcon(): React.JSX.Element {
	return <FeedForkedIcon size={24} color="var(--ds-background-information-bold)"/>;
}

export async function showToast(
	task: Task | Error,
	{message, doneMessage}: {message: string; doneMessage?: string},
): Promise<void> {
	initToastContainer();

	const iconContainer = (<div>{forkingIcon()}</div>);
	const textContainer = (<div>{message}</div>);
	const closeButton = (
		<button
			className="close-button" type="button" onClick={() => {
				closeToast();
			}}
		><XIcon size={24}/>
		</button>
	);
	const toast = (
		<div
			data-color-mode={getDataColorMode()} data-light-theme="light" data-dark-theme="dark_dimmed"
			role="alert"
			style={{zIndex: 601,
				padding: '16px', borderRadius: '8px',
				gap: '4px',
			}}
			className="position-absolute top-lg-4 right-2 ml-5 mb-5 d-flex box-sha color-shadow-large"
		>
			{iconContainer}
			{textContainer}
			{closeButton}
		</div>
	);

	const closeToast = (): void => {
		toast.remove();
	};

	const updateToast = (message: string | React.JSX.Element): void => {
		if (typeof message === 'string') {
			textContainer.textContent = message;
			return;
		}

		textContainer.replaceChildren(message);
	};

	toastContainer.prepend(toast);
	await delay(30);

	try {
		if (task instanceof Error) {
			throw task;
		}

		await (typeof task === 'function' ? task(updateToast) : task);

		iconContainer.firstChild!.replaceWith(successIcon());

		if (doneMessage !== undefined) {
			updateToast(doneMessage);
		}
	} catch (error) {
		iconContainer.firstChild!.replaceWith(errorIcon());

		if (error instanceof Error) {
			updateToast(error.message);
		} else if (typeof error === 'string') {
			updateToast(error);
		}

		throw error;
	} finally {
		// RequestAnimationFrame(() => {
		// 	setTimeout(() => {
		// 		 Toast.remove();
		// 	}, 3000);
		// });
	}
}

export async function confirmToast(content: string): Promise<boolean> {
	initToastContainer();

	return new Promise<boolean>(resolve => {
		const yesButton = (
			<button
				className="btn btn-sm btn-primary" type="button" onClick={() => {
					yesClicked();
				}}
			>Yes
			</button>
		);
		const noButton = (
			<button
				className="btn btn-sm" type="button" onClick={() => {
					noClicked();
				}}
			>No
			</button>
		);
		const modal = (
			<div
				data-color-mode={getDataColorMode()} data-light-theme="light" data-dark-theme="dark_dimmed"
				role="alert"
				style={{zIndex: 601,
					padding: '16px', borderRadius: '8px',
					backdropFilter: 'blur(10px)',
					gap: '4px',
				}}
				className="position-absolute top-lg-4 right-2 ml-5 mb-5 box-sha color-shadow-large"
			>
				<div className="p-2" style={{whiteSpace: 'pre-line'}}>{content}</div>
				<div className="d-flex" style={{gap: '4px', justifyContent: 'flex-end'}}>
					{yesButton}
					{noButton}
				</div>
			</div>
		);

		const yesClicked = (): void => {
			modal.remove();
			resolve(true);
		};

		const noClicked = (): void => {
			modal.remove();
			resolve(false);
		};

		toastContainer.prepend(modal);
	});
}
