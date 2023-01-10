import React, {useState} from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useGLTF, useTexture} from '@react-three/drei';
import {type TankType, TankTypes} from '@game/models/TankType';

export default function TankModel(props: {type: TankType}) {
	const tank = React.useRef<THREE.Group>(null);
	const gltf = useGLTF('/glb/tank.glb');
	const [parts, setParts] = useState<THREE.Object3D[]>();
	if (!parts) {
		setParts(Object.values(gltf.nodes).map(node => node.clone()));
	}

	const [meshMap] = useTexture([TankTypes[props.type].url]);
	meshMap.flipY = false;
	meshMap.encoding = THREE.sRGBEncoding;
	meshMap.repeat.set(1, 1);

	useFrame(() => {
		const a = Date.now() / 1000;
		if (tank.current) {
			tank.current.rotation.y = a;
		}
	});

	return (
		<>
			<pointLight position={[10, 10, 10]} />
			<group ref={tank} position={[0, -0.3, 0]}>
				{parts?.map(part => (
					<primitive key={part.name} object={part} castShadow={true} receiveShadow={true}>
						<meshStandardMaterial map={meshMap} />
					</primitive>
				),
				)}
			</group>
		</>
	);
}

useGLTF.preload('/glb/tank.glb');

