import * as Phaser from 'phaser';
import {enable3d, Canvas} from '@enable3d/phaser-extension';
import MainScene from '@game/scenes/mainScene';
import Network from '@game/network/Network';

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.WEBGL,
	transparent: true,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		width: window.innerWidth * Math.max(1, window.devicePixelRatio / 2),
		height: window.innerHeight * Math.max(1, window.devicePixelRatio / 2),
	},
	scene: [MainScene],
	...Canvas(),
};

export function start() {
	enable3d(() => new Phaser.Game(config)).withPhysics('/ammo/kripken');
}

export async function createGame(roomId: string, isHost: boolean) {
	const network = Network.getInstance();
	if (isHost) {
		await network.createRoom(roomId);
	} else {
		await network.joinRoom(roomId);
	}

	start();
}
