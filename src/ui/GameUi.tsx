import React from 'react';
import {toast, Toaster} from 'react-hot-toast';
import ConnectionToast from './toast/ConnectionToast';
import KillToast from './toast/KillToast';

export default function GameUi({children}: {children: React.ReactNode}) {
	return (
		<>
			<div className='absolute inset-x-0 top-0 m-auto w-48'>
				<div
					onClick={() => {
						toast.custom(
							<ConnectionToast playerName='Player #1' type='join' />,
						);
					}}
				>
          Player Joined
				</div>
				<div
					onClick={() => {
						toast.custom(
							<ConnectionToast playerName='Player #1' type='leave' />,
						);
					}}
				>
          Player left
				</div>
				<div
					onClick={() => {
						toast.custom(<KillToast playerName='Player #1' />);
					}}
				>
          Player killed
				</div>
			</div>

			<Toaster
				position='top-right'
				gutter={2}
				toastOptions={{
					duration: 2000,
				}}
			/>
			{children}
		</>
	);
}
