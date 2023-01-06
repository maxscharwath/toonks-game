import Game from '@game/scenes/game';
import {PhysicsLoader, Project} from 'enable3d';
import {WebGLRenderer} from 'three';
import InitScene from '@game/scenes/initScene';
import {type Network} from '@game/network/Network';
import {type NetworkEvents} from '@game/network/NetworkEvents';

export async function startGame(canvas: HTMLCanvasElement, network: Network<NetworkEvents>) {
	return new Promise<Project>(resolve => {
		PhysicsLoader('/ammo/kripken', () => {
			const project = new Project({
				renderer: new WebGLRenderer({
					canvas,
					antialias: true,
				}),
				scenes: [InitScene({network}), Game],
			});
			resolve(project);
			return project;
		});
	});
}
