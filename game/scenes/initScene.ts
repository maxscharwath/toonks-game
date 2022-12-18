import {Scene3D, type THREE} from 'enable3d';
import {type Network} from '@game/network/Network';
import Tank from '@game/models/Tank';

export type GameConfig = {
	network: Network;
};

export default (config: GameConfig) => class extends Scene3D {
	async preload() {
		await this.load.preload('tree', '/glb/tree.glb');
		await this.load.preload('rock', '/glb/rock.glb');
		await Tank.loadModel(this.load, '/glb/tank.glb');
	}

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
		(this.camera as THREE.PerspectiveCamera).aspect = newWidth / newHeight;
		this.camera.updateProjectionMatrix();
	}

	async create() {
		await this.start('MainScene', config);
	}
};
