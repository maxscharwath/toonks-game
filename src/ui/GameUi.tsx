import React from 'react';
import {Toaster} from 'react-hot-toast';

export default function GameUi({children}: {children: React.ReactNode}) {
	return (
		<>
			<Toaster
				position='top-right'
				gutter={4}
				containerStyle={{zIndex: 9999}}
				toastOptions={{
					duration: 2000,
				}}
			/>
			{children}
		</>
	);
}
