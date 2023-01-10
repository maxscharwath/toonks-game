import Game from '@game/scenes/Game';
import {PhysicsLoader} from 'enable3d';
import {WebGLRenderer} from 'three';
import {type Network} from '@game/network/Network';
import {type Metadata, type NetworkEvents} from '@game/network/NetworkEvents';
import {Project} from '@game/scenes/Project';

async function startGame(canvas: HTMLCanvasElement, network: Network<NetworkEvents, Metadata>) {
	return new Promise<{
		project: Project;
		game: Game;
	}>(resolve => {
		PhysicsLoader('/ammo/kripken', () => {
			const game = new Game({
				network,
			});
			const project = new Project({
				renderer: new WebGLRenderer({
					canvas,
					antialias: true,
				}),
				scene: game,
			});
			resolve({
				project,
				game,
			});
			return project;
		});
	});
}

export function initGame() {
	let project: Project;
	return {
		async start(canvas: HTMLCanvasElement, network: Network<NetworkEvents, Metadata>) {
			const result = await startGame(canvas, network);
			project = result.project;
			return result.game;
		},
		stop() {
			project?.renderer?.dispose();
		},
	};
}
