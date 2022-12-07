import MainScene from '@game/scenes/mainScene';
import {PhysicsLoader, Project} from 'enable3d';
import {WebGLRenderer} from 'three';
import InitScene from '@game/scenes/initScene';
import type Network from '@game/network/Network';

export async function startGame(canvas: HTMLCanvasElement, network: Network) {
	return new Promise<Project>(resolve => {
		PhysicsLoader('/ammo/kripken', () => {
			const project = new Project({
				renderer: new WebGLRenderer({
					canvas,
					antialias: true,
				}),
				scenes: [InitScene({network}), MainScene],
			});
			resolve(project);
			return project;
		});
	});
}
