export default function getDataColorMode(): 'light' | 'dark' {
	const html = document.querySelector('html');

	if (html === null || html === undefined) {
		return 'light';
	}

	const item = html.attributes.getNamedItem('data-color-mode');

	if (item === null) {
		return 'light';
	}

	if (item.value === 'dark') {
		return 'dark';
	}

	return 'light';
}
