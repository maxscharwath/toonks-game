import React, {useEffect, useRef, useState} from 'react';
import {useNetwork} from '@/store/store';
import Button from '@/ui/Button';

export default function Connected() {
	const {network} = useNetwork();

	const [messages, setMessages] = useState<string[]>([]);

	useEffect(() => {
		console.log('connected');
		network.on('data', ({data}) => {
			setMessages(messages => [...messages, data as string]);
		});
		return () => {
			network.clearListeners('data');
		};
	}, []);

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2
				className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
			Connected
			</h2>
			<Button
				onClick={() => {
					network.send('Hello World!');
				}}
				fullWidth
				size='large'
			>
			Say Hello
			</Button>
			<div className='flex max-h-52 flex-col space-y-4 overflow-y-auto'>
				{messages.map((message, i) => (
					<div key={i} className='flex flex-row space-x-4'>
						<div className='shrink-0'>
							<img className='h-10 w-10 rounded-full' src='https://i.pravatar.cc/300' alt='' />
						</div>
						<div className='min-w-0 flex-1'>
							<p className='truncate text-sm font-medium text-gray-900 dark:text-white'>Toonker</p>
							<p className='truncate text-sm text-gray-500 dark:text-gray-400'>{message}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
