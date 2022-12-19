import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Group, Object3D, type Vector3} from 'three';
import {type Scene3D} from 'enable3d/dist/scene3d';
import {type GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {ExtendedObject3D, THREE} from 'enable3d';

export default class Explosion extends Entity {
	static async loadModel(loader: Plugins.Loaders, url: string) {
		this.model = (await loader.gltf(url));
	}

	private static model: GLTF;

	readonly object3d: ExtendedObject3D;

	constructor(scene: Scene3D, private readonly position: Vector3, private readonly scale: number = 0.15) {
		super(scene, 'explosion', {});
		this.object3d = new ExtendedObject3D();
		this.object3d.add(Explosion.model.scene.clone());
		this.object3d.scale.set(this.scale, this.scale, this.scale);
		const light = new THREE.PointLight(0xffdf5e, 10, 80);
		light.castShadow = true;
		this.object3d.add(light);
		scene.animationMixers.add(this.object3d.anims.mixer);
		Explosion.model.animations.forEach(animation => {
			if (animation.name) {
				this.object3d.anims.add(animation.name, animation);
			}
		});
		this.object3d.anims.mixer.timeScale = (1 / this.scale);
		this.object3d.anims.mixer.addEventListener('finished', () => {

		});
		this.object3d.anims.mixer.addEventListener('finished', () => {
			this.destroy();
		});
		this.object3d.anims.play('IcosphereAction', 0, false);
	}

	addToScene(): void {
		this.object3d.position.copy(this.position);
		this.scene.add.existing(this.object3d);
	}

	destroy(): void {
		this.object3d.clear();
		this.removeFromScene();
	}

	removeFromScene(): void {
		this.object3d.parent?.remove(this.object3d);
	}

	update(): void {
		// Do nothing
	}
}