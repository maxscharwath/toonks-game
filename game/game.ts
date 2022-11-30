import MainScene from '@game/scenes/mainScene';
import Network from '@game/network/Network';
import {Canvas, enable3d} from '@enable3d/phaser-extension';

export async function start() {
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
	enable3d(() => new Phaser.Game(config)).withPhysics('/ammo/kripken');
}

export async function createGame(roomId: string, isHost: boolean) {
	const network = Network.getInstance();
	if (isHost) {
		await network.createRoom(roomId);
	} else {
		await network.joinRoom(roomId);
	}

	await start();
}
