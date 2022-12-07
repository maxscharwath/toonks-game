import React from 'react';
import Button from '@/ui/Button';
import {useNavigate} from 'react-router-dom';

export default function Connected() {
	const navigate = useNavigate();

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2
				className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
			Connected
			</h2>
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
