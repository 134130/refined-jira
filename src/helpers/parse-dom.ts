export function parseDOM(html: string): HTMLElement {
	const parser = new DOMParser()
	const document =  parser.parseFromString(html, 'text/html')
	return document.documentElement
}
