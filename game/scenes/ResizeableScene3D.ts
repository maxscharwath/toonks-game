import {Scene3D, type THREE} from 'enable3d';

export default class ResizeableScene3D extends Scene3D {
	init() {
		this.resize();
		window.addEventListener('resize', () => {
			this.resize();
		});
	}

	resize() {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		this.renderer.setSize(newWidth, newHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		const camera = this.camera as THREE.PerspectiveCamera;
		camera.aspect = newWidth / newHeight;
		camera.updateProjectionMatrix();
	}
}
