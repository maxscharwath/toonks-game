import appLogo from '@/assets/logo.svg';
import React from 'react';
import {motion, useMotionValue, useTransform} from 'framer-motion';

export default function Logo(props: {style?: any}) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);

	const rotateX = useTransform(y, [-100, 100], [45, -45]);
	const rotateY = useTransform(x, [-100, 100], [-45, 45]);

	return (
		<div
			style={{
				width: 300,
				height: 300,
				...props?.style,
				display: 'flex',
				placeItems: 'center',
				placeContent: 'center',
				perspective: 400,
			}}
		>
			<motion.img
				src={appLogo}
				whileHover={{scale: 1.05}}
				drag
				dragConstraints={{left: 0, right: 0, top: 0, bottom: 0}}
				dragElastic={0.1}
				style={{
					x,
					y,
					rotateX,
					rotateY,
				}}
				className='drop-shadow-lg'
				alt='Toonks logo'
			/>
		</div>
	);
}
