import Tank, {type TankExport, TankState} from '@game/models/Tank';
import {GUI} from 'lil-gui';
import Stats from 'stats.js';
import {Scene3D, THREE} from 'enable3d';
import {type GameConfig} from '@game/scenes/initScene';
import {type FlatArea} from '@enable3d/three-graphics/jsm/flat/flat';
import {AdvancedThirdPersonControls} from '@game/utils/advancedThirdPersonControls';
import {ChunkLoader} from '@game/world/ChunkLoader';
import {World} from '@game/world/World';
import {ChunkPopulator} from '@game/world/ChunkPopulator';
import {Sun} from '@game/utils/Sun';
import PlayerController from '@game/utils/PlayerController';
import Entity from '@game/models/Entity';

export default class MainScene extends Scene3D {
	private readonly entities = new Map<string, Tank>();
	private player!: Tank;
	private readonly stats = new Stats();

	private data!: GameConfig;
	private control!: AdvancedThirdPersonControls;
	private sun!: Sun;
	private readonly playerController = new PlayerController(this);

	constructor() {
		super({key: 'MainScene'});
	}

	init(data: GameConfig) {
		this.data = data;
		this.playerController.init();
	}

	async create() {
		const listener = new THREE.AudioListener();
		this.camera.add(listener);

		this.sun = new Sun(this);
		this.scene.add(this.sun);

		// Fog
		const fogColor = new THREE.Color('#63a7ff');
		this.scene.fog = new THREE.Fog(fogColor, 0, 100);
		this.scene.background = new THREE.Color(fogColor);

		const chunkLoader = new ChunkLoader({
			worldHeightMapUrl: '/images/heightmap.png',
			chunkSize: 128,
			scale: 0.25,
		});

		const treeModel = (await this.load.gltf('tree')).scenes[0];
		treeModel.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = true;
				child.castShadow = true;
			}
		});
		treeModel.scale.set(0.5, 0.5, 0.5);

		const rockModel = (await this.load.gltf('rock')).scenes[0];
		rockModel.traverse(child => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = true;
				child.castShadow = true;
			}
		});
		rockModel.scale.set(0.5, 0.5, 0.5);

		const chunkPopulator = new ChunkPopulator()
			.addElement(treeModel)
			.addElement(rockModel);

		const world = new World(chunkLoader, chunkPopulator);

		// Generate a 5x5 chunk area
		const chunks = await world.generateArea(8, 8, 4);
		chunks.forEach(chunk => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call
			this.add.existing(chunk);
			chunk.addPhysics(this);
		});
		const chunk = await world.getChunk(8, 8);

		const position = chunk.getCenterPos();
		position.y += 0.5;

		this.player = new Tank(this, new THREE.Vector3(position.x, position.y, position.z));
		this.player.addToScene();
		this.entities.set(this.player.uuid, this.player);

		this.playerController.setTank(this.player);

		this.control = new AdvancedThirdPersonControls(this.camera, this.player.object3d, this.renderer.domElement, {
			offset: new THREE.Vector3(0, 0, 0),
			targetRadius: 5,
		});
		this.control.useThirdPerson();
		const panel = new GUI();
		const params = {
			debug: false,
			mode: 2049,
			cameramode: 'Follow',
		};

		panel.add(params, 'cameramode', ['Follow', 'Free']).onChange((value: string) => {
			if (value === 'Follow') {
				this.control.useThirdPerson();
			} else {
				this.control.useOrbitControls();
			}
		});
		panel.add(params, 'debug').onChange((value: boolean) => {
			if (value) {
				this.physics.debug?.enable();
			} else {
				this.physics.debug?.disable();
			}
		});
		panel
			.add(params, 'mode', [1 + 2048, 1 + 4096, 1 + 2048 + 4096])
			.onChange((value: number) => {
				this.physics.debug?.mode(value);
			});
		this.renderer.domElement.parentElement?.appendChild(this.stats.dom);
		this.data.network.on('data', ({data}) => {
			const entity = this.entities.get(data.uuid);
			if (entity) {
				entity.import(data);
			} else {
				const tank = new Tank(this, position);
				tank.addToScene();
				tank.import(data);
				this.entities.set(data.uuid, tank);
			}
		});
		setInterval(() => {
			this.data.network.send(this.player.export());
		}, 100);
	}

	update() {
		this.stats.begin();
		this.control.update();
		this.sun.update();
		this.playerController.update();

		this.entities.forEach(entity => {
			entity.update();
		});

		this.stats.end();
	}
}
