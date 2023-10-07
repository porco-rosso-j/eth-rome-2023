import {Buffer} from 'buffer';
import { ArtifactStore } from '@railgun-community/wallet';
import localforage from 'localforage';

// export const createArtifactStore = (): ArtifactStore => {
//   return new ArtifactStore(
//     async (path: string) => {
//       return localforage.getItem(path);
//     },
//     async (path: string, item: string | Buffer) => {
//       await localforage.setItem(path, item);
//     },
//     async (path: string) => (await localforage.getItem(path)) != null,
//   );
// }
// export const artifactStore = createArtifactStore();

// brower version
const createArtifactStore = (): ArtifactStore => {
  return new ArtifactStore(
    async (path: string) => {
      return localforage.getItem(path);
    },
    async (dir: string, path: string, item: string | Buffer) => {
      await localforage.setItem(path, item);
    },
    async (path: string) => (await localforage.getItem(path)) != null,
  );
}

export const artifactStore = createArtifactStore();