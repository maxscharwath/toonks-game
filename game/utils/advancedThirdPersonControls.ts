import {PointerDrag, PointerLock, ThirdPersonControls, type ThirdPersonControlsConfig} from 'enable3d';
import {type Object3D, type OrthographicCamera, type PerspectiveCamera} from 'three';

export class AdvancedThirdPersonControls extends ThirdPersonControls {
	private delta = {x: 0, y: 0};

	constructor(camera: PerspectiveCamera | OrthographicCamera, target: Object3D, element: HTMLElement, config: ThirdPersonControlsConfig) {
		super(camera, target, config);
		const pointerLock = new PointerLock(element);
		const pointerDrag = new PointerDrag(element);
		pointerDrag.onMove(delta => {
			if (!pointerLock.isLocked()) {
				return;
			}

			this.delta = delta;
		});
	}

	public update() {
		const {x, y} = this.delta;
		super.update(x * 3, y * 3);
		this.delta = {x: 0, y: 0};
	}
}
