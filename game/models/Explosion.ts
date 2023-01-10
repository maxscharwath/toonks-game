import Entity from '@game/models/Entity';
import type * as Plugins from '@enable3d/three-graphics/jsm/plugins';
import {type Vector3} from 'three';
import {type GLTF} from 'three/examples/jsm/loaders/GLTFLoader';
import {ExtendedObject3D, THREE} from 'enable3d';
import shortUuid from 'short-uuid';
import type Game from '@game/scenes/Game';

export default class Explosion extends Entity {
	static async loadModel(loader: Plugins.Loaders, url: string) {
		this.model = (await loader.gltf(url));
	}

	private static model: GLTF;

	readonly object3d: ExtendedObject3D;

	constructor(game: Game, private readonly position: Vector3, private readonly scale: number = 0.15) {
		super(game, shortUuid.uuid());
		this.object3d = new ExtendedObject3D();
		this.object3d.add(Explosion.model.scene.clone());
		this.object3d.scale.set(this.scale, this.scale, this.scale);
		const light = new THREE.PointLight(0xffdf5e, 1, 10);
		// Light.castShadow = true;
		this.object3d.add(light);
		game.animationMixers.add(this.object3d.anims.mixer);
		Explosion.model.animations.forEach(animation => {
			if (animation.name) {
				this.object3d.anims.add(animation.name, animation);
			}
		});
		this.object3d.anims.mixer.timeScale = (1 / this.scale);
		this.object3d.anims.mixer.addEventListener('finished', () => {
			this.destroy();
		});
		this.object3d.anims.play('IcosphereAction', 0, false);
	}

	addToScene(): void {
		this.object3d.position.copy(this.position);
		this.game.add.existing(this.object3d);
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

	export(): Record<string, unknown> {
		return {};
	}

	import(state: Record<string, unknown>): void {
		// Do nothing
	}
}
