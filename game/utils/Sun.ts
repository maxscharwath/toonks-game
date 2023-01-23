import {DirectionalLight, HemisphereLight} from 'three';
import {type Scene3D, THREE} from 'enable3d';

export class SkyBox extends THREE.Group {
	get alpha(): number {
		return this._alpha;
	}

	set alpha(value: number) {
		this._alpha = Math.max(0, Math.min(1, value));
		this.skybox.material.opacity = 1 - this._alpha;
		this.starbox.material.opacity = this._alpha;
	}

	private readonly skybox: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
	private readonly starbox: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>;
	private _alpha = 0;

	constructor() {
		super();
		const skyboxTexture = new THREE.TextureLoader().load('/images/skybox.webp');
		this.skybox = this.createMesh(skyboxTexture, 10, {
			blending: THREE.CustomBlending,
			blendEquation: THREE.AddEquation,
			blendSrc: THREE.DstColorFactor,
			blendDst: THREE.DstColorFactor,
		});

		const starTexture = new THREE.TextureLoader().load('/images/starbox.webp');
		starTexture.wrapS = THREE.RepeatWrapping;
		starTexture.wrapT = THREE.RepeatWrapping;
		starTexture.repeat.set(3, 3);
		this.starbox = this.createMesh(starTexture, -10);
		this.add(this.skybox, this.starbox);
	}

	public update() {
		this.skybox.rotation.y += 0.0002;
		this.starbox.rotation.y += 0.0001;
	}

	private createMesh(texture: THREE.Texture, z = 0, materialOptions: Partial<THREE.MeshBasicMaterialParameters> = {}) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(1000 + z, 50, 50),
			new THREE.MeshBasicMaterial({
				...materialOptions,
				side: THREE.BackSide,
				fog: false,
				map: texture,
				transparent: true,
			}),
		);
	}
}

export class Sun extends DirectionalLight {
	public angle = Math.PI / 2;
	private readonly skybox: SkyBox;

	constructor(private readonly scene: Scene3D) {
		super(0xffffff, 1);
		const shadowDistance = 80;
		const shadowSize = 2048;
		this.shadow.camera.bottom = -shadowDistance;
		this.shadow.camera.top = shadowDistance;
		this.shadow.camera.left = -shadowDistance;
		this.shadow.camera.right = shadowDistance;
		this.shadow.mapSize.width = shadowSize;
		this.shadow.mapSize.height = shadowSize;
		this.castShadow = true;
		const hemisphereLight = new HemisphereLight(0xffffff, 0x000000, 0.5);
		this.add(hemisphereLight);

		this.skybox = new SkyBox();
		this.scene.add.existing(this.skybox);
	}

	public update() {
		this.angle += 0.0001;
		const distance = 300;
		const {camera} = this.scene;

		const x = (distance * Math.cos(this.angle)) + camera.position.x;
		const y = (distance * Math.sin(this.angle)) + camera.position.y;
		const z = (distance * Math.sin(this.angle)) + camera.position.z;
		this.target = camera;
		this.position.set(x, y, z);

		const color = new THREE.Color('#adc1d8').lerp(new THREE.Color('#002e5a'), 1 - (y / distance));
		this.scene.scene.background = color;
		this.scene.scene.fog!.color = color;

		this.skybox.position.x = camera.position.x;
		this.skybox.position.z = camera.position.z;
		this.skybox.position.y = camera.position.y - 100;
		this.skybox.update();
		this.skybox.alpha = 1 - (y / distance);
	}
}
