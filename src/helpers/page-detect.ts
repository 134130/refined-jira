function always(): boolean {
	return true;
}

function isBacklogPage(): boolean {
	const url = new URL(location.href);
	return url.pathname.endsWith('/backlog');
}

const pageDetect = {
	always,
	isBacklogPage,
};
export default pageDetect;
