import {StrictlyParseSelector} from 'typed-query-selector/parser';
import 'webextension-polyfill-global';

declare global {
	interface ParentNode {
		querySelector<S extends string>(selector: S | readonly S[]): StrictlyParseSelector<S, HTMLElement> | undefined;

		querySelectorAll<S extends string>(
			selector: S | readonly S[],
		): NodeListOf<StrictlyParseSelector<S, HTMLElement>>;
	}

	interface Element {
		closest<S extends string>(selector: S | readonly S[]): StrictlyParseSelector<S, HTMLElement> | undefined;
		matches(selectors: string | readonly string[]): boolean;
	}
}
