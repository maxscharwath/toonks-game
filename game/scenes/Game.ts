import {GUI} from 'lil-gui';
import Stats from 'stats.js';
import {THREE} from 'enable3d';
import {AdvancedThirdPersonControls} from '@game/utils/AdvancedThirdPersonControls';
import {ChunkLoader} from '@game/world/ChunkLoader';
import {World} from '@game/world/World';
import {ChunkPopulator} from '@game/world/ChunkPopulator';
import {Sun} from '@game/utils/Sun';
import PlayerController from '@game/utils/PlayerController';
import Tank from '@game/models/Tank';
import TankNetwork from '@game/models/TankNetwork';
import Random from '@game/utils/Random';
import {Chunk} from '@game/world/Chunk';
import GameEvent from '@game/event/GameEvent';
import TankPlayer from '@game/models/TankPlayer';
import Explosion from '@game/models/Explosion';
import ResizeableScene3D from '@game/scenes/ResizeableScene3D';
import {type Metadata, type NetworkEvents} from '@game/network/NetworkEvents';
import {type Network} from '@game/network/Network';

export type GameConfig = {
	network: Network<NetworkEvents, Metadata>;
};

export default class Game extends ResizeableScene3D {
	public events = new GameEvent();
	public player!: TankPlayer;
	public world!: World;

	private readonly entities = new Map<string, Tank>();
	private readonly stats = new Stats();

	private readonly config: GameConfig;
	private control!: AdvancedThirdPersonControls;
	private sun!: Sun;
	private readonly playerController = new PlayerController(this);

	constructor(config: GameConfig) {
		super({key: 'GameScene'});
		this.config = config;
		this.events.setNetwork(config.network);
	}

	async preload() {
		await this.load.preload('tree', '/glb/tree.glb');
		await this.load.preload('rock', '/glb/rock.glb');
		await Tank.loadModel(this.load, '/glb/tank.glb');
		await Explosion.loadModel(this.load, '/glb/fireball.glb');
	}

	init() {
		super.init();
		this.playerController.init();
	}

	async create() {
		const listener = new THREE.AudioListener();
		this.camera.add(listener);

		this.sun = new Sun(this);
		this.scene.add(this.sun);

		// Fog
		const fogColor = new THREE.Color('#63a7ff');
		this.scene.fog = new THREE.Fog(fogColor, 50, 150);
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
		const data = this.config.network.getMetadata();
		this.player.import({
			pseudo: data?.name,
			type: data?.tank,
		});
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

		{ // Wall
			const sphere = new THREE.SphereGeometry(50, 200, 200);
			const map = new THREE.TextureLoader().load('/images/storm.png');
			map.wrapS = map.wrapT = THREE.RepeatWrapping;
			map.repeat.set(8, 8);
			map.rotation = Math.PI / 2;

			const material = new THREE.MeshPhysicalMaterial({
				roughness: 0.3,
				transmission: 0.9,
				thickness: 1,
				displacementMap: map,
				displacementScale: 10,
				displacementBias: -5,
				color: 0x00ff00,
				map,
				side: THREE.DoubleSide,
			} as THREE.MeshPhysicalMaterialParameters);
			const mesh = new THREE.Mesh(sphere, material);
			mesh.position.set(position.x, 0, position.z);
			this.scene.add(mesh);
		}

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

		this.config.network?.channel('update').on((res: any[]) => {
			// Got tank update from server
			res.forEach((data: any) => {
				const entity = this.entities.get(data.uuid);

				if (entity) {
					// Update entity but not player
					if (entity.uuid === this.player.uuid) {
						return;
					}

					entity.import(data);
				} else {
					// Create new entity from data
					const position = new THREE.Vector3().fromArray(data.position);
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
			if (this.config.network?.isHost) {
				const entities = Array.from(this.entities.values()).map(entity => entity.export());
				this.config.network?.channel('update').send(entities);
			} else {
				this.config.network?.channel('update').send([this.player.export()]);
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
