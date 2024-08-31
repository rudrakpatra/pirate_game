import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const load = async () => {
	const gltfLoader = new GLTFLoader();
	const ship = await gltfLoader.loadAsync('empty_ship/scene.gltf');
	return { ship };
};
export type LoadedAssets = Awaited<ReturnType<typeof load>>;
