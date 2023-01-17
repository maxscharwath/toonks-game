import {ThreeGraphics} from '@enable3d/three-graphics/jsm';
import {type ThreeGraphicsConfig} from '@enable3d/common/dist/types';
import {type Scene3D} from 'enable3d';

type Scene3dConfig = Record<string, unknown> & Omit<ThreeGraphicsConfig, 'camera' | 'usePhysics' | 'enableXR'> & {
	parent?: string;
	scene: Scene3D;
};

export class Project extends ThreeGraphics {
	public parent: HTMLElement;
	public canvas: HTMLCanvasElement;

	constructor(private readonly projectConfig: Scene3dConfig) {
		super(projectConfig);

		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.debug.checkShaderErrors = false;

		if (this.projectConfig.parent) {
			this.parent = document.getElementById(this.projectConfig.parent)!;
		} else {
			this.parent = document.body;
		}

		if (!this.parent) {
			this.parent = document.body;
		}

		this.parent.appendChild(this.renderer.domElement);

		this.canvas = this.renderer.domElement;

		const s = projectConfig.scene;

		const plug = {
			// Scene configuration
			sceneConfig: {
				textureAnisotropy: this.textureAnisotropy,
				autoStart: false,
			},
			// Add core features from three-graphicsconfig: {
			renderer: this.renderer,
			parent: this.parent,
			canvas: this.canvas,
			scene: this.scene, // Three scene
			scenes: [s],
			camera: this.camera,
			cache: this.cache,
			physics: this.physics,
		};

		s.initializeScene(plug);
		void s.start();
	}
}
