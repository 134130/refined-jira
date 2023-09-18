declare module 'size-plugin';

type Deinit = {disconnect: VoidFunction} | {clear: VoidFunction} | {destroy: VoidFunction} | {abort: VoidFunction} | VoidFunction;

type FeatureID = string & {feature: true};

declare namespace JSX {
	type BaseElement = IntrinsicElements['div'];
	type IntrinsicAttributes = {
		width?: number;
		height?: number;
	} & BaseElement;
}

type HTMLFormControlsCollection = Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement | HTMLSelectElement>;

declare module 'react' {
	const FC = (): JSX.Element => JSX.Element;
	const React = {FC};
	export default React;
}

type SignalAsOptions = {
	signal?: AbortSignal;
};
