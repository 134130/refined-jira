const handlers = new EventTarget()

const observer = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		const target = mutation.target as HTMLBodyElement

		if (mutation.oldValue?.split(' ').some(clazz => clazz.startsWith('ghx-loading')
		&& Array.from(target.classList).every(clazz => !clazz.startsWith('ghx-loading')))) {
			handlers.dispatchEvent(new Event('page-load'));
		}
	}
})

export default function onProgressBar(callback: VoidFunction, signal?: AbortSignal): void {
	observer.observe(document.body, {attributeOldValue: true, attributeFilter: ['class']});
	handlers.addEventListener('page-load', callback, {signal});

	// document.addEventListener('change', callback, {signal});
}
