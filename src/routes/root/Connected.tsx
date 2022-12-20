import React from 'react';
import Button from '@/ui/Button';
import {useNavigate} from 'react-router-dom';
import {useNetwork} from '@/store/store';

export default function Connected() {
	const navigate = useNavigate();
	const {code, network} = useNetwork();

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2
				className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
				{code}
			</h2>

			<h3 className='text-black dark:text-white'>{ network?.connectedPeersNumber() } players connected (data not reactive)</h3>
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
