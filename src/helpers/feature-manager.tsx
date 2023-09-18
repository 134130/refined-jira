import {Promisable} from 'type-fest';
import domLoaded from 'dom-loaded';

import onAbort from './abort-controller.js';
import onProgressBar from "../events/on-progress-bar";
import ArrayMap from "./map-of-arrays";

type BooleanFunction = () => boolean;
export type CallerFunction = (callback: VoidFunction, signal: AbortSignal) => void | Promise<void> | Deinit;
type FeatureInitResult = void | false | Deinit;
type FeatureInit = (signal: AbortSignal) => Promisable<FeatureInitResult>;

type InternalRunConfig = {
	/** Every condition must be true */
	asLongAs?: BooleanFunction[] | undefined;
	/** At least one condition must be true */
	include: BooleanFunction[] | undefined;
	/** No conditions must be true */
	exclude?: BooleanFunction[] | undefined;
	init: FeatureInit;
	additionalListeners: CallerFunction[];
	onlyAdditionalListeners: boolean;
};

type FeatureLoader = {
	/** Whether to wait for DOM ready before running `init`. By default, it runs `init` as soon as `body` is found. @default false */
	awaitDomReady?: true;

	/** When true, don’t run the `init` on page load but only add the `additionalListeners`. @default false */
	onlyAdditionalListeners?: true;

	init: FeatureInit; // Repeated here because this interface is Partial<>
} & Partial<InternalRunConfig>;

const currentFeatureControllers = new ArrayMap<FeatureID, AbortController>();

function logError(url: string, error: unknown): void {
	const id = getFeatureID(url);
	// const message = error instanceof Error ? error.message : String(error);

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console
	console.group(`❌ ${id}`); // Safari supports only one parameter
	console.log(error);
	console.groupEnd();
}

const log = {
	info: console.log,
	http: console.log,
	error: logError,
};

function getFeatureID(url: string): FeatureID {
	return url.split('/').pop()!.split('.')[0] as FeatureID;
}

function shouldFeatureRun({
	asLongAs = [() => true],
	include = [() => true],
	exclude = [() => false],
}): boolean {
	return asLongAs.every(c => c()) && include.some(c => c()) && exclude.every(c => !c());
}

async function add(url: string, ...loaders: FeatureLoader[]): Promise<void> {
	const id = getFeatureID(url);
	for (const loader of loaders) {
		const {asLongAs, include, exclude, init, onlyAdditionalListeners = false, additionalListeners = []} = loader;

		if (include?.length === 0) {
			throw new Error('`include` cannot be an empty array, it means "run nowhere"');
		}

		const details = {asLongAs, include, exclude, init, additionalListeners, onlyAdditionalListeners};

		// if (awaitDomReady) {
		// 	(async () => {
		// 		await domLoaded;
		// 		await setupPageLoad(id, details);
		// 	})();
		// } else {
		// 	void setupPageLoad(id, details);
		// }

		onProgressBar(() => {
			void setupPageLoad(id, details);
		})
	}
}

async function setupPageLoad(id: FeatureID, config: InternalRunConfig): Promise<void> {
	const {asLongAs, include, exclude, init, onlyAdditionalListeners, additionalListeners} = config;

	if (!shouldFeatureRun({asLongAs, include, exclude})) {
		return;
	}

	const featureController = new AbortController();
	currentFeatureControllers.append(id, featureController)

	const runFeature = async (): Promise<void> => {
		let result: FeatureInitResult;

		try {
			result = await init(featureController.signal);

			if (result !== false) {
				log.info('✅', id);
			}
		} catch (error) {
			log.error(id, error);
		}

		if (result) {
			onAbort(featureController, result);
		}
	};

	if (!onlyAdditionalListeners) {
		await runFeature();
	}

	await domLoaded; // Listeners likely need to work on the whole page
	for (const listener of additionalListeners) {
		const deinit = listener(runFeature, featureController.signal);
		if (deinit && !(deinit instanceof Promise)) {
			onAbort(featureController, deinit);
		}
	}
}

onProgressBar(() => {
	for(const [id, feature] of currentFeatureControllers.entries()) {
		console.log(`Aborting ${id}`)
		for (const controller of feature) {
			controller.abort();
		}
	}

	currentFeatureControllers.clear();
});

const features = {
	add,
};
export default features;
