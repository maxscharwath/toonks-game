import React from 'react';
import Button from '@/ui/Button';
import {generatePath, useNavigate} from 'react-router-dom';
import {useNetwork} from '@/store/store';
import TankModel from '@/ui/TankModel';
import {Canvas} from '@react-three/fiber';

export default function Connected() {
	const navigate = useNavigate();
	const {code, peers, maxNbPlayers} = useNetwork();

	const handleCopy = () => {
		if (code) {
			const url = window.location.origin + generatePath('/join/:code', {code});
			void navigator.clipboard.writeText(url);
		}
	};

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2 className='flex justify-center'>
				<button
					onClick={handleCopy}
					className='group flex items-center text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'
				>
					{code}
					<span className='mx-1 text-gray-500 transition-transform duration-100 group-hover:text-gray-700 group-active:scale-90 dark:text-gray-400 dark:group-hover:text-gray-300'>
						<svg xmlns='http://www.w3.org/2000/svg' width='1em' height='1em' viewBox='0 0 24 24'><path fill='currentColor' d='M14 22H4a1.934 1.934 0 0 1-2-2V10a1.934 1.934 0 0 1 2-2h4V4a1.934 1.934 0 0 1 2-2h10a1.934 1.934 0 0 1 2 2v10a1.935 1.935 0 0 1-2 2h-4v4a1.935 1.935 0 0 1-2 2ZM4 10v10h10v-4h-4a1.935 1.935 0 0 1-2-2v-4H4Zm6-6v10h10V4H10Z'></path></svg>
					</span>
				</button>
			</h2>
			<h2 className='bg:text-white flex justify-center'>
				{peers.length} / {maxNbPlayers} player(s) connected
			</h2>
			<div className='grid grid-cols-3 gap-3'>
				{peers.map(peer => (
					<div
						className='flex flex-col items-center space-y-2 rounded-lg bg-gray-100 py-4 dark:bg-gray-700'
						key={peer.uuid}
					>
						<h2 className='w-full truncate px-4 text-center text-lg font-bold text-gray-900 dark:text-white'>
							{peer.metadata.name}
						</h2>
						<div>
							<Canvas camera={{fov: 35, zoom: 1.5}}>
								<TankModel type={peer.metadata.tank}/>
							</Canvas>
						</div>
					</div>
				))}
			</div>
			<Button
				onClick={() => {
					navigate('/game');
				}}
				fullWidth
				size='large'
			>
				Play
			</Button>
		</div>
	);
}
