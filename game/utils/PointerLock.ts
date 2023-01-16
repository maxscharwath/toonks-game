import Emittery from 'emittery';

export class PointerLock extends Emittery<{
	pointerlockchange: boolean;
}> {
	constructor(private readonly element: HTMLElement) {
		super();
		document.addEventListener('pointerlockchange', event => {
			void this.emit('pointerlockchange', this.isLocked());
		});
		element.addEventListener('pointerdown', () => {
			this.lock();
		});
	}

	public isLocked() {
		return document.pointerLockElement === this.element;
	}

	public lock() {
		if (!this.isLocked()) {
			this.element.requestPointerLock();
		}
	}

	public unlock() {
		if (this.isLocked()) {
			document.exitPointerLock();
		}
	}
}
