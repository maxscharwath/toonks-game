import {ExtendedMesh, type ExtendedObject3D, type Scene3D, THREE} from 'enable3d';
import chroma from 'chroma-js';
import {type BufferGeometry, Mesh, type Object3D} from 'three';
import {SimplifyModifier} from 'three/examples/jsm/modifiers/SimplifyModifier';
import {Geometry} from 'three/examples/jsm/deprecated/Geometry';

export class Chunk {
	private _mesh?: ExtendedMesh;
	private scene?: Scene3D;

	get chunkSize() {
		return 64;
	}

	private get heightScale() {
		return 4;
	}

	public get mesh() {
		if (!this._mesh) {
			this._mesh = this.make();
		}

		return this._mesh;
	}

	constructor(readonly x: number, readonly y: number, private readonly pixels: ImageData) {
	}

	public addTo(scene: Scene3D, physics = false) {
		this.scene = scene;
		// eslint-disable-next-line @typescript-eslint/no-unsafe-call
		this.scene.add.existing(this.mesh);
		if (physics) {
			this.addPhysics();
		}

		return this;
	}

	public removeFrom() {
		this.scene?.destroy(this.mesh);
		this.removePhysics();
		return this;
	}

	public addPhysics() {
		this.scene?.physics.add.existing(this.mesh as unknown as ExtendedObject3D, {mass: 0, collisionFlags: 1});
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

		const colorScale = chroma
			.scale(['#003eb2', '#0952c6', '#a49463', '#867645', '#3c6114', '#5a7f32', '#8c8e7b', '#a0a28f', '#ebebeb'])
			.domain([0, 0.025, 0.1, 0.2, 0.25, 0.8, 1.3, 1.45, 1.6]);

		// Material

		const material = new THREE.MeshPhongMaterial({color: 0xcccccc, side: THREE.DoubleSide, vertexColors: true});

		const mesh = new ExtendedMesh(geometry, material);
		mesh.receiveShadow = true;
		mesh.castShadow = true;
		mesh.shape = 'concave';
		mesh.position.set(this.x * this.chunkSize, 0, this.y * this.chunkSize);

		const vertices = geometry.attributes.position.array;
		for (let i = 0; i < vertices.length; i++) {
			// @ts-expect-error - TS doesn't know that we're only using the first 2 channels
			vertices[(i * 3) + 2] = (this.pixels.data[i * 4] - 15) / this.heightScale;
		}

		const modifier = new SimplifyModifier();
		const count = Math.floor(geometry.attributes.position.count * 0.5); // Number of vertices to remove
		geometry.copy(modifier.modify(geometry, count));
		{// Colors
			const {count} = geometry.attributes.position;
			geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
			const color = new THREE.Color();
			const positions = geometry.attributes.position;
			const colors = geometry.attributes.color;
			for (let i = 0; i < count; i++) {
				const z = positions.getZ(i);
				const hsl = colorScale(z).hsl();
				color.setHSL(hsl[0] / 360, hsl[1], hsl[2]);
				colors.setXYZ(i, color.r, color.g, color.b);
			}
		}

		mesh.rotateX(-Math.PI / 2);
		mesh.updateMatrix();

		geometry.computeVertexNormals();

		mesh.name = 'heightmap';

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
		if ((side === 'left' && x === -half) || (side === 'right' && x === half) || (side === 'top' && y === half) || (side === 'bottom' && y === -half)) {
			indices.push(i);
		}
	}

	return indices;
}

export function fadeBorder(chunkA: Chunk, chunkB: Chunk) {
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
}
