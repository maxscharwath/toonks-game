import React from 'react';
import {useFrame} from '@react-three/fiber';
import * as THREE from 'three';
import {useGLTF, useTexture} from '@react-three/drei';

export default function TankModel(props: {url: string}) {
	const tank = React.useRef<THREE.Group>(null);
	const {nodes} = useGLTF('/glb/tank.glb');
	const [meshMap] = useTexture([props.url]);
	meshMap.flipY = false;
	meshMap.encoding = THREE.sRGBEncoding;
	meshMap.repeat.set(1, 1);

	useFrame(({clock}) => {
		const a = clock.getElapsedTime();
		if (tank.current) {
			tank.current.rotation.y = a;
		}
	});

	return (
		<>
			<pointLight position={[10, 10, 10]} />
			<group ref={tank}>
				{Object.values(nodes).map(node => (
					<primitive key={node.name} object={node}>
						<meshStandardMaterial map={meshMap} />
					</primitive>
				),
				)}
			</group>
		</>
	);
}

useGLTF.preload('/glb/tank.glb');

