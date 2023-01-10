import React, {Suspense} from 'react';
import {useFrame, useLoader} from '@react-three/fiber';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {TextureLoader} from 'three';
import {useGLTF} from '@react-three/drei';
import {useTexture} from '@react-three/drei';

export default function TankModel() {
	const gltf = useLoader(GLTFLoader, '/glb/tank.glb');
	const meshMap = useLoader(TextureLoader, '/images/tank/military.png');
	const tank = React.useRef();
	const {nodes, materials} = useGLTF('/glb/tank.glb');

	useFrame(({clock}) => {
		const a = clock.getElapsedTime();
		tank.current.rotation.y = a;
	});

	// Return (
	// 	<>
	// 		<pointLight position={[10, 10, 10]} />
	// 		<mesh ref={tank}>
	// 			<primitive object={gltf.scene} dispose={null} />
	// 			<meshStandardMaterial map={meshMap} />
	// 		</mesh>
	// 	</>
	// );

	const props = useTexture({
		map: '/images/tank/military.png',
	});

	return (
		<mesh>
			<pointLight position={[10, 10, 10]} />
			{/* <sphereGeometry args={[1, 16, 16]} /> */}
			<mesh ref={tank} {...props}>
				<primitive object={gltf.scene} dispose={null} />
			</mesh>
		</mesh>
	);
}

useGLTF.preload('/glb/tank.glb');

