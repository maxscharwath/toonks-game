import {DirectionalLight, HemisphereLight} from 'three';
import {type Scene3D, THREE} from 'enable3d';

export class Sun extends DirectionalLight {
	public angle = Math.PI / 2;

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
	}

	public update() {
		this.angle += 0.0001;
		const distance = 300;
		const {camera} = this.scene;

		const x = (distance * Math.cos(this.angle)) + camera.position.x;
		const y = distance * Math.sin(this.angle);
		const z = (distance * Math.sin(this.angle)) + camera.position.z;
		this.target = camera;
		this.position.set(x, y, z);

		const color = new THREE.Color('#adc1d8').lerp(new THREE.Color('#002e5a'), 1 - (y / distance));
		this.scene.scene.background = color;
		this.scene.scene.fog!.color = color;
	}
}
