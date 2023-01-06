import Tank from '@game/models/Tank';

export default class TankPlayer extends Tank {
	shoot() {
		const hadShoot = super.shoot();
		if (hadShoot) {
			this.game.events.send('tank:shoot', this.uuid);
		}

		return hadShoot;
	}
}
