import {ExtendedGroup, ExtendedMesh, type ExtendedObject3D, THREE} from 'enable3d';
import {SimplifyModifier} from 'three/examples/jsm/modifiers/SimplifyModifier';
import {HeightMapMaterial} from '@game/world/HeightMapMaterial';
import {WaterMaterial} from '@game/world/WaterMaterial';
import type Game from '@game/scenes/Game';

export class Chunk extends ExtendedGroup {
	private static waterMaterial: WaterMaterial;
	private static heightmapMaterial: HeightMapMaterial;
	static get waterLevel() {
		return 2.1;
	}

	static {
		const oceanTexture = new THREE.TextureLoader().load('/images/dirt.png');
		oceanTexture.wrapS = oceanTexture.wrapT = THREE.RepeatWrapping;
		const sandTexture = new THREE.TextureLoader().load('/images/sand.png');
		sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
		const grassTexture = new THREE.TextureLoader().load('/images/grass.png');
		grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
		const rockTexture = new THREE.TextureLoader().load('/images/rock.png');
		rockTexture.wrapS = rockTexture.wrapT = THREE.RepeatWrapping;
		const snowTexture = new THREE.TextureLoader().load('/images/snow.png');
		snowTexture.wrapS = snowTexture.wrapT = THREE.RepeatWrapping;
		const texture = new THREE.TextureLoader().load('/images/water.png');
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(10, 10);
		this.waterMaterial = new WaterMaterial(texture);

		this.heightmapMaterial = new HeightMapMaterial({
			oceanTexture,
			sandTexture,
			grassTexture,
			rockTexture,
			snowTexture,
		});
	}

	public readonly chunkId: number;
	public lastUpdate = 0;

	private isDestroyed = false;
	private hasPhysics = false;
	private _mesh?: {
		mesh: ExtendedMesh;
		minGroundHeight: number;
	};

	private _physicsMesh?: ExtendedMesh;

	constructor(private readonly game: Game, readonly x: number, readonly y: number, private readonly pixels: ImageData) {
		super();
		this.chunkId = (x << 16) | y;
		console.log('Created chunk', x, y);

		this.add(this.mesh);
		if (this.minGroundHeight <= Chunk.waterLevel) {
			this.add(this.makeWater());
		}
	}

	public getChunkPosition() {
		return this.mesh.position;
	}

	public get mesh() {
		if (!this._mesh) {
			this._mesh = this.make();
		}

		return this._mesh.mesh;
	}

	public get physicsMesh() {
		if (!this._physicsMesh) {
			const {geometry} = this.mesh;
			const modifier = new SimplifyModifier();

			const simplified = modifier.modify(geometry, (geometry.attributes.position.count * 0.3) | 0);
			simplified.computeVertexNormals();
			const mesh = new ExtendedMesh(simplified);
			mesh.position.copy(this.mesh.position);
			mesh.rotateX(-Math.PI / 2);
			mesh.shape = 'concave';
			this._physicsMesh = mesh;
		}

		return this._physicsMesh;
	}

	public get minGroundHeight() {
		return this._mesh?.minGroundHeight ?? 0;
	}

	static get chunkSize() {
		return 64;
	}

	private get heightScale() {
		return 4;
	}

	public addPhysics() {
		if (!this.game || this.hasPhysics) {
			return;
		}

		this.hasPhysics = true;
		this.game.physics.add.existing(this.physicsMesh as unknown as ExtendedObject3D, {mass: 0, collisionFlags: 1});
		return this;
	}

	public removePhysics() {
		this.hasPhysics = false;
		this.game?.physics.destroy(this.physicsMesh as unknown as ExtendedObject3D);
		return this;
	}

	public getPositionAt(x: number, y: number): THREE.Vector3 {
		const {position} = this.mesh;
		const size = Chunk.chunkSize / 2;
		const h = this.getHeightAt(x, y);
		const pos = position.clone().add(new THREE.Vector3(x - size, h, y - size));
		return pos;
	}

	public getCenterPosition(): THREE.Vector3 {
		const size = Chunk.chunkSize / 2;
		return this.getPositionAt(size, size);
	}

	public update() {
		if (this.isDestroyed) {
			return;
		}

		this.lastUpdate = Date.now();

		if (this.game) {
			const distance = this.getChunkPosition().distanceTo(this.game.player.object3d.position);
			const maxDistance = Chunk.chunkSize * 1.2;
			const isViewable = distance < maxDistance;
			if (isViewable) {
				this.addPhysics();
			} else {
				this.removePhysics();
			}
		}
	}

	public destroy() {
		console.log('Destroying chunk', this.x, this.y);
		this.isDestroyed = true;
		this.removePhysics();
		this.mesh.geometry.dispose();
		this.physicsMesh?.geometry.dispose();
		this.clear();
		this.removeFromParent();
	}

	private getHeightAt(x: number, y: number): number {
		const x1 = Math.round((x / Chunk.chunkSize) * this.pixels.width);
		const y1 = Math.round((y / Chunk.chunkSize) * this.pixels.height);
		const h = this.pixels.data[((y1 * this.pixels.width) + x1) * 4];
		return (h - 15) / this.heightScale;
	}

	private make() {
		const {width, height} = this.pixels;
		const geometry = new THREE.PlaneGeometry(Chunk.chunkSize, Chunk.chunkSize, width - 1, height - 1);

		const vertices = geometry.attributes.position.array;
		let minGroundHeight = Infinity;
		for (let i = 0; i < vertices.length; i++) {
			const h = (this.pixels.data[i * 4] - 15) / this.heightScale;
			if (isNaN(h)) {
				continue;
			}

			// @ts-expect-error - TS doesn't know that we're only using the first 2 channels
			vertices[(i * 3) + 2] = h;
			minGroundHeight = Math.min(minGroundHeight, h);
		}

		geometry.computeVertexNormals();

		const mesh = new ExtendedMesh(geometry, Chunk.heightmapMaterial);
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		mesh.position.set(this.x * Chunk.chunkSize, 0, this.y * Chunk.chunkSize);
		mesh.rotateX(-Math.PI / 2);

		mesh.name = 'heightmap';

		return {mesh, minGroundHeight};
	}

	private makeWater() {
		const geometry = new THREE.PlaneGeometry(Chunk.chunkSize, Chunk.chunkSize, 100, 100);
		const mesh = new ExtendedMesh(geometry, Chunk.waterMaterial);
		mesh.position.set(this.x * Chunk.chunkSize, Chunk.waterLevel, this.y * Chunk.chunkSize);
		mesh.rotateX(-Math.PI / 2);
		mesh.name = 'water';
		return mesh;
	}
}

type Side = 'left' | 'right' | 'top' | 'bottom';

function determineSide(chunkA: Chunk, chunkB: Chunk): [Side, Side] {
	return chunkA.x === chunkB.x
		? (chunkA.y < chunkB.y ? ['top', 'bottom'] : ['bottom', 'top'])
		: (chunkA.x < chunkB.x ? ['right', 'left'] : ['left', 'right']);
}

function getSideIndices(chunk: Chunk, side: Side) {
	const {geometry} = chunk.mesh;
	const half = Chunk.chunkSize / 2;
	const indices = [];
	for (let i = 0; i < geometry.attributes.position.count; i++) {
		const x = geometry.attributes.position.getX(i);
		const y = geometry.attributes.position.getY(i);
		if ((side === 'left' && x === -half) || (side === 'right' && x === half) || (side === 'top' && y === -half) || (side === 'bottom' && y === half)) {
			indices.push(i);
		}
	}

	return indices;
}

export function mergeChunkMesh(chunkA: Chunk, chunkB: Chunk) {
	const [sideA, sideB] = determineSide(chunkA, chunkB);
	const indicesA = getSideIndices(chunkA, sideA);
	const indicesB = getSideIndices(chunkB, sideB);
	for (let i = 0; i < indicesA.length; i++) {
		const indexA = indicesA[i];
		const indexB = indicesB[i];
		const zA = chunkA.mesh.geometry.attributes.position.getZ(indexA);
		const zB = chunkB.mesh.geometry.attributes.position.getZ(indexB);
		const z = (zA + zB) / 2;
		chunkA.mesh.geometry.attributes.position.setZ(indexA, z);
		chunkB.mesh.geometry.attributes.position.setZ(indexB, z);
	}

	chunkA.mesh.geometry.computeVertexNormals();
	chunkB.mesh.geometry.computeVertexNormals();
	chunkB.mesh.geometry.attributes.position.needsUpdate = true;
	chunkA.mesh.geometry.attributes.position.needsUpdate = true;
}
