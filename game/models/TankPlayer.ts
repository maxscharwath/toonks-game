import Tank from '@game/models/Tank';
import type Game from '@game/scenes/Game';
import {THREE} from 'enable3d';
import {LineGeometry} from 'three/examples/jsm/lines/LineGeometry';
import {LineMaterial} from 'three/examples/jsm/lines/LineMaterial';
import {Line2} from 'three/examples/jsm/lines/Line2';

class ShootHelper extends Line2 {
	constructor(private readonly tank: Tank) {
		const material = new LineMaterial({
			color: 0xff0000,
			linewidth: 0.05,
			transparent: true,
			opacity: 0.4,
			worldUnits: true,
		});

		super(new LineGeometry(), material);
		this.rotateY(-Math.PI / 2);
	}

	public update() {
		const force = this.tank.getCanonDirection().multiplyScalar(10000);
		const speed = new THREE.Vector2(Math.hypot(force.x, force.z), force.y);
		const bulletWeight = 100;
		const gravity = 9.8;
		const tMax = 5;

		const nbSteps = 50;

		const points = Array.from({length: nbSteps}, (_, i) => {
			const t = i * (tMax / nbSteps);
			const x = t * speed.x;
			const y = (t * speed.y) - (0.5 * (gravity * bulletWeight) * t * t);
			return [x, y, 0];
		}).flat();
		this.geometry.setPositions(points);
		this.computeLineDistances();
	}
}

export default class TankPlayer extends Tank {
	private readonly shootHelper = new ShootHelper(this);
	public constructor(game: Game, position: THREE.Vector3, uuid?: string) {
		super(game, position, uuid);
		this.headlights.forEach(light => {
			light.castShadow = true;
		});
		this.canon.add(this.shootHelper);

		this.properties.getProperty('canonAngle').onChange(() => {
			this.shootHelper.update();
		}, true);
	}

	shoot() {
		const hadShoot = super.shoot();
		if (hadShoot) {
			this.game.events.send('tank:shoot', this.uuid);
		}

		return hadShoot;
	}

	honk() {
		super.honk();
		this.game.events.send('tank:honk', this.uuid);
	}
}
