import {ExtendedObject3D, THREE} from 'enable3d';

export function meshToExtendedObject3D(o?: THREE.Object3D): ExtendedObject3D {
	const obj = new ExtendedObject3D();
	if (o) {
		obj.rotation.copy(o.rotation);
		if (o instanceof THREE.Mesh) {
			o.geometry.center();
		}

		o.position.set(0, 0, 0);
		o.rotation.set(0, 0, 0);
		obj.add(o);
	}

	return obj;
}
