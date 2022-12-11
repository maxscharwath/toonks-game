import {ExtendedGroup, ExtendedMesh, type ExtendedObject3D, type Scene3D, THREE} from 'enable3d';
import {type Object3D} from 'three';
import {SimplifyModifier} from 'three/examples/jsm/modifiers/SimplifyModifier';
import {HeightMapMaterial} from '@game/world/HeightMapMaterial';
import {WaterMaterial} from '@game/world/WaterMaterial';

export class Chunk extends ExtendedGroup {
	private static waterMaterial: WaterMaterial;
	private static heightmapMaterial: HeightMapMaterial;

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
		this.waterMaterial = new WaterMaterial(texture);

		this.heightmapMaterial = new HeightMapMaterial({
			oceanTexture,
			sandTexture,
			grassTexture,
			rockTexture,
			snowTexture,
		});
	}

	private scene?: Scene3D;
	private _mesh?: ExtendedMesh;

	constructor(readonly x: number, readonly y: number, private readonly pixels: ImageData) {
		super();
		this.add(this.mesh);
		this.add(this.makeWater());
	}

	public get mesh() {
		if (!this._mesh) {
			this._mesh = this.make();
		}

		return this._mesh;
	}

	get chunkSize() {
		return 64;
	}

	private get heightScale() {
		return 4;
	}

	public addPhysics(scene: Scene3D) {
		this.scene = scene;
		const {geometry} = this.mesh;
		const modifier = new SimplifyModifier();
		// eslint-disable-next-line no-bitwise
		const simplified = modifier.modify(geometry, (geometry.attributes.position.count * 0.3) | 0);
		simplified.computeVertexNormals();
		const mesh = new ExtendedMesh(simplified);
		mesh.position.copy(this.mesh.position);
		mesh.rotateX(-Math.PI / 2);
		mesh.shape = 'concave';
		this.scene?.physics.add.existing(mesh as unknown as ExtendedObject3D, {mass: 0, collisionFlags: 1});
		return this;
	}

	public removePhysics() {
		this.scene?.physics.destroy(this.mesh as unknown as ExtendedObject3D);
		return this;
	}

	public getCenterPosition(): THREE.Vector3 {
		const raycaster = new THREE.Raycaster();
		const {x} = this.mesh.position;
		const {z} = this.mesh.position;
		raycaster.set(new THREE.Vector3(x, 1000, z), new THREE.Vector3(0, -1, 0));
		const intersects = raycaster.intersectObject(this.mesh as Object3D);
		return intersects[0]?.point ?? new THREE.Vector3(x, 0, z);
	}

	private make() {
		const {width, height} = this.pixels;
		const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, width - 1, height - 1);

		const vertices = geometry.attributes.position.array;
		for (let i = 0; i < vertices.length; i++) {
			// @ts-expect-error - TS doesn't know that we're only using the first 2 channels
			vertices[(i * 3) + 2] = (this.pixels.data[i * 4] - 15) / this.heightScale;
		}

		geometry.computeVertexNormals();

		const mesh = new ExtendedMesh(geometry, Chunk.heightmapMaterial);
		mesh.receiveShadow = true;
		mesh.castShadow = true;

		mesh.position.set(this.x * this.chunkSize, 0, this.y * this.chunkSize);
		mesh.rotateX(-Math.PI / 2);

		mesh.name = 'heightmap';

		return mesh;
	}

	private makeWater() {
		const geometry = new THREE.PlaneGeometry(this.chunkSize, this.chunkSize, 100, 100);
		const mesh = new ExtendedMesh(geometry, Chunk.waterMaterial);
		mesh.position.set(this.x * this.chunkSize, 2.1, this.y * this.chunkSize);
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
	const half = chunk.chunkSize / 2;
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
}
