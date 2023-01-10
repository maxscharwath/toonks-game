import React, {Suspense} from 'react';
import {useFrame, useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {TextureLoader} from 'three';
import {useGLTF} from '@react-three/drei';

export default function TankModel({url}) {
	const gltf = useLoader(GLTFLoader, '/glb/tank.glb');
	const meshMap = useLoader(TextureLoader, url ?? '/images/tank/heig.png');
	const tank = React.useRef();
	const {nodes, materials} = useGLTF('/glb/tank.glb');

	useFrame(({clock}) => {
		const a = clock.getElapsedTime();
		tank.current.rotation.y = a;
	});

	return (
		<mesh>
			<pointLight position={[10, 10, 10]} />
			<mesh ref={tank} >
				<primitive object={gltf.scene} dispose={null} />
			</mesh>
		</mesh>
	);
}

useGLTF.preload('/glb/tank.glb');

