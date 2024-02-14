import { Buffer } from "buffer";
import { isDefined } from "@railgun-community/shared-models";
import { ArtifactStore } from "@railgun-community/wallet";
import localforage from "localforage";
export const createArtifactStore = (path?: string): ArtifactStore => {
	return new ArtifactStore(
		async (path: string) => {
			return localforage.getItem(path);
		},
		async (path: string, item: string | Uint8Array) => {
			await localforage.setItem(path, item);
		},
		async (path: string) => (await localforage.getItem(path)) != null
	);
};

export class CustomArtifactStore extends ArtifactStore {
	constructor() {
		super(
			async (path: string) => {
				return localforage.getItem(path);
			},
			async (_dir: string, path: string, item: string | Uint8Array) => {
				await localforage.setItem(path, item);
			},
			async (path: string) => isDefined(await localforage.getItem(path))
		);
	}
}
