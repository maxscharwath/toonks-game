import {type ExtendedObject3D} from 'enable3d';
import {type Audio} from '@game/utils/AudioManager';
import type Game from '@game/scenes/Game';
import {type Vector3} from 'three';

export type Bullet = ExtendedObject3D & {
	audio: Audio;
	destroy: () => void;
	onCollision: (callback: (object: ExtendedObject3D) => void) => void;
};

export function makeBullet(game: Game, position: Vector3): Bullet {
	const bullet = game.physics.add.sphere(
		{radius: 0.1, x: position.x, y: position.y, z: position.z, mass: 100},
		{phong: {color: 0x202020}},
	);
	const audio = game.audioManager.createAudio();
	audio.setVolume(0.1);
	bullet.add(audio);
	audio.play('/sounds/whistle.ogg');

	const timeout = setTimeout(() => {
		destroy();
	}, 2000);

	const destroy = () => {
		game.physics.destroy(bullet);
		audio.stop();
		bullet.removeFromParent();
		clearTimeout(timeout);
	};

	return Object.assign(bullet, {
		audio,
		onCollision(callback: (object: ExtendedObject3D) => void) {
			bullet.body.on.collision(otherObject => {
				destroy();
				callback(otherObject);
			});
		},
		destroy,
	});
}
