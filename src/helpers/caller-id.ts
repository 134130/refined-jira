export default function getCallerID(ancestor = 1): string {
	/* +1 because the first line comes from this function */
	return hashString(getStackLine(new Error('Get stack').stack!, ancestor + 1));
}

export function getStackLine(stack: string, line: number): string {
	return stack
	// Remove non-stacktrace line from array (missing in Firefox) #6032
		.replace('Error: Get stack\n', '')!
		.split('\n')
		.at(line) ?? warn(stack, line);
}

function hashString(string: string): string {
	let hash = 0;

	for (const character of string) {
		// eslint-disable-next-line no-bitwise
		hash = ((hash << 5) - hash) + character.codePointAt(0)!;
	}

	return String(Math.trunc(hash));
}

function warn(stack: string, line: number): string {
	console.warn('The stack doesn’t have the line', {line, stack});
	return Math.random().toString(16);
}
