import {GUI} from 'lil-gui';
import Stats from 'stats.js';
import {Scene3D, THREE} from 'enable3d';
import {type GameConfig} from '@game/scenes/initScene';
import {AdvancedThirdPersonControls} from '@game/utils/AdvancedThirdPersonControls';
import {ChunkLoader} from '@game/world/ChunkLoader';
import {World} from '@game/world/World';
import {ChunkPopulator} from '@game/world/ChunkPopulator';
import {Sun} from '@game/utils/Sun';
import PlayerController from '@game/utils/PlayerController';
import type Tank from '@game/models/Tank';
import TankNetwork from '@game/models/TankNetwork';
import Random from '@game/utils/Random';
import {Chunk} from '@game/world/Chunk';
import GameEvent from '@game/event/GameEvent';
import TankPlayer from '@game/models/TankPlayer';

export default class Game extends Scene3D {
	public events = new GameEvent();

	private readonly entities = new Map<string, Tank>();
	player!: TankPlayer;
	private readonly stats = new Stats();

	private data!: GameConfig;
	private control!: AdvancedThirdPersonControls;
	private sun!: Sun;
	private readonly playerController = new PlayerController(this);
	private world!: World;

	constructor() {
		super({key: 'GameScene'});
	}

	init(data: GameConfig) {
		this.data = data;
		this.events.setNetwork(data.network);
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

		this.world = new World(this, chunkLoader, chunkPopulator);

		const chunk = await this.world.getChunk(8, 8);

		const random = new Random();
		const position = chunk.getPositionAt(
			(Chunk.chunkSize / 2) + random.number(-Chunk.chunkSize / 4, Chunk.chunkSize / 4),
			(Chunk.chunkSize / 2) + random.number(-Chunk.chunkSize / 4, Chunk.chunkSize / 4),
		);
		position.y += 1;

		this.player = new TankPlayer(this, position);
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

		this.data.network?.channel('update').on((res: any[]) => {
			res.forEach((data: any) => {
				const entity = this.entities.get(data.uuid);

				if (entity) {
					if (entity.uuid === this.player.uuid) {
						return;
					}

					entity.import(data);
				} else {
					const tank = new TankNetwork(this, position, data.uuid);
					tank.addToScene();
					tank.import(data);
					this.entities.set(data.uuid, tank);
				}
			});
		});

		this.events.on('tank:shoot', uuid => {
			const entity = this.entities.get(uuid);

			if (entity && entity.uuid !== this.player.uuid) {
				entity.shoot();
			}
		});

		setInterval(() => {
			void this.world.update();
		}, 1000);

		setInterval(() => {
			void this.world.update();
			if (this.data.network?.isHost) {
				const entities = Array.from(this.entities.values()).map(entity => entity.export());
				entities.push(this.player.export());
				this.data.network?.channel('update').send(entities);
			} else {
				this.data.network?.channel('update').send([this.player.export()]);
			}
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
