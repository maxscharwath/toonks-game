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
import AudioManager from '@game/utils/AudioManager';

export type GameConfig = {
	network: Network<NetworkEvents, Metadata>;
};

class TankManager extends Map<string, Tank> {
	private readonly networkTanks = new Map<string, WeakRef<TankNetwork>>();

	public set(uuid: string, tank: Tank) {
		if (this.has(uuid)) {
			return this;
		}

		if (tank instanceof TankNetwork) {
			this.networkTanks.set(tank.uuid, new WeakRef(tank));
		}

		return super.set(uuid, tank);
	}

	public add(tank: Tank) {
		return this.set(tank.uuid, tank);
	}

	public delete(uuid: string) {
		this.networkTanks.delete(uuid);
		return super.delete(uuid);
	}

	public clear() {
		this.networkTanks.clear();
		super.clear();
	}

	public getNetwork(uuid: string) {
		return this.networkTanks.get(uuid)?.deref();
	}

	public getTanks() {
		return [...this.values()];
	}

	public getNetworks() {
		return [...this.networkTanks.values()].map(ref => ref.deref()).filter(Boolean);
	}

	public get array() {
		return [...this.values()];
	}
}

export default class Game extends ResizeableScene3D {
	public readonly events = new GameEvent();
	public readonly audioManager = new AudioManager();

	public player!: TankPlayer;
	public world!: World;

	public readonly tanks = new TankManager();
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
		this.audioManager.setCamera(this.camera);

		this.sun = new Sun(this);
		this.scene.add(this.sun);
		// Fog
		const fogColor = new THREE.Color('#63a7ff');
		this.scene.fog = new THREE.Fog(fogColor, 50, 150);
		this.scene.background = new THREE.Color(fogColor);
		const skybox = new THREE.Mesh(
			new THREE.SphereGeometry(1000, 50, 50),
			new THREE.MeshBasicMaterial({
				blending: THREE.CustomBlending,
				blendEquation: THREE.AddEquation,
				blendSrc: THREE.DstColorFactor,
				blendDst: THREE.DstColorFactor,
				side: THREE.BackSide,
				fog: false,
				map: new THREE.TextureLoader().load('/images/skybox.png'),
			}),
		);
		skybox.position.y = -100;
		this.scene.add(skybox);

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
		this.tanks.add(this.player);

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
			// This.scene.add(mesh);
		}

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
			if (!this.player) {
				return;
			}

			// Got tank update from server
			res.forEach((data: any) => {
				if (!data?.uuid || data.uuid === this.player.uuid) {
					return;
				}

				const entity = this.tanks.getNetwork(data.uuid);
				if (entity) {
					entity.import(data);
				} else {
					// Create new entity from data
					const position = new THREE.Vector3().fromArray(data.position);
					const tank = new TankNetwork(this, position, data.uuid);
					this.tanks.add(tank);
					tank.addToScene();
					tank.import(data);
				}
			});
		});

		this.events.on('tank:shoot', uuid => {
			this.tanks.getNetwork(uuid)?.shoot();
		});

		this.events.on('tank:honk', uuid => {
			this.tanks.getNetwork(uuid)?.honk();
		});

		this.events.on('tank:hit', ({damage, to}) => {
			this.tanks.get(to)?.hit(damage);
		});

		setInterval(() => {
			void this.world.update();
			if (this.config.network?.isHost) {
				const entities = this.tanks.array.map(entity => entity.export());
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

		this.tanks.forEach(entity => {
			entity.update();
		});

		this.stats.end();
	}
}
