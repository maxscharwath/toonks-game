import React from 'react';
import {toast, Toaster} from 'react-hot-toast';

export default function GameUi({children}: {children: React.ReactNode}) {
	return (
		<>
			<div className='absolute inset-x-0 top-0 m-auto w-48'>
				<div
					onClick={() => {
						toast('Player #1 joined the server', {icon: '🔥'});
					}}
				>
        Player Joined
				</div>
				<div
					onClick={() => {
						toast('Player #1 left the server', {icon: '👋'});
					}}
				>
        Player left
				</div>
				<div
					onClick={() => {
						toast('Player #1 was killed', {icon: '☠️'});
					}}
				>
        Player killed
				</div>
			</div>

			<Toaster
				position='top-right'
				gutter={2}
				toastOptions={{
					className:
          'text-gray-300 font-bold border border-toonks-orange/50 bg-gray-800/75 px-3 py-2 rounded-full text-xs',
					duration: 2000,
				}}
			/>
			{children}
		</>
	);
}
