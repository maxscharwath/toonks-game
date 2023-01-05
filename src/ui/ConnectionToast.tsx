import {motion} from 'framer-motion';
import React from 'react';

export default function ConnectionToast({
	playerName,
	type,
}: {
	playerName: string;
	type: 'join' | 'leave';
}) {
	return (
		<motion.div
			initial={{opacity: 1}}
			animate={{opacity: 0, scale: 0.95}}
			exit={{opacity: 0}}
			transition={{delay: 1, duration: 1}}
			className='rounded-md bg-gray-900/50 px-3 py-2 font-bold leading-snug text-gray-200'>
			<svg
				width='24'
				height='24'
				viewBox='0 0 21 21'
				className='-ml-1 -mt-0.5 mr-1 inline-block'
			>
				{type === 'join' ? (
					<g
						fill='none'
						fillRule='evenodd'
						stroke='#14b8a6'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='m9.5 13.5l3-3l-3-3m3 3h-9' />
						<path d='M4.5 8.5V5.492a2 2 0 0 1 1.992-2l7.952-.032a2 2 0 0 1 2.008 1.993l.04 10.029A2 2 0 0 1 14.5 17.49h-8a2 2 0 0 1-2-2V12.5' />
					</g>
				) : (
					<g
						fill='none'
						fillRule='evenodd'
						stroke='#f97316'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<path d='m11.5 13.535l-3-3.035l3-3m7 3h-10' />
						<path d='M16.5 8.5V5.54a2 2 0 0 0-1.992-2l-8-.032A2 2 0 0 0 4.5 5.5v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3' />
					</g>
				)}
			</svg>
			<span>{playerName}</span>
		</motion.div>
	);
}
