import {PointerDrag, ThirdPersonControls, type ThirdPersonControlsConfig} from 'enable3d';
import {type Object3D, type OrthographicCamera, type PerspectiveCamera} from 'three';
import {PointerLock} from '@game/utils/PointerLock';

export class AdvancedThirdPersonControls {
	private delta = {x: 0, y: 0};
	private readonly pointerLock: PointerLock;
	private readonly pointerDrag: PointerDrag;
	private controls?: ThirdPersonControls;

	constructor(private readonly cam: PerspectiveCamera | OrthographicCamera, private readonly element: HTMLElement, private readonly config: ThirdPersonControlsConfig) {
		this.pointerLock = new PointerLock(this.element);
		this.pointerDrag = new PointerDrag(this.element);
		this.pointerDrag.onMove(delta => {
			if (this.pointerLock?.isLocked()) {
				this.delta = delta;
			}
		});
	}

	public onPointerLockChange(callback: (isLocked: boolean) => void) {
		return this.pointerLock.on('pointerlockchange', callback);
	}

	public setTarget(target: Object3D) {
		this.controls = new ThirdPersonControls(this.cam, target, this.config);
	}

	public update() {
		const {x, y} = this.delta;
		this.controls?.update(x * 3, y * 3);
		this.delta = {x: 0, y: 0};
	}

	public dispose() {
		this.pointerLock.unlock();
	}
}
