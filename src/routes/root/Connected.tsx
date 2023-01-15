import React, {Suspense} from 'react';
import Button from '@/ui/Button';
import {useNavigate} from 'react-router-dom';
import {useNetwork} from '@/store/store';
import TankModel from '@/ui/TankModel';
import {TankTypeList} from '@game/models/TankType';
import {Canvas} from '@react-three/fiber';

export default function Connected() {
	const navigate = useNavigate();
	const {code, peers} = useNetwork();

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2
				className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
				{code}
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
