export class PointerLock {
	constructor(private readonly element: HTMLElement) {
		element.addEventListener('pointerdown', () => {
			this.lock();
		});
	}

	public isLocked() {
		return Boolean(document.pointerLockElement);
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
