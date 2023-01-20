import {type Scene3D, THREE} from 'enable3d';

function lightBuffer<T extends THREE.Light>(length: number, constructor: () => T) {
	const lights = Array.from({length}, constructor);
	let i = 0;
	return {
		init(scene: Scene3D) {
			scene.add.existing(...lights);
		},
		next() {
			const light = lights[i];
			i = (i + 1) % lights.length;
			return light;
		},
	};
}

export const pointLightBuffer = lightBuffer(3, () => new THREE.PointLight(0xffdf5e, 3, 20, 2));
