import type Tank from '@game/models/Tank';
import React from 'react';
import {Toaster} from 'react-hot-toast';
import PlayersStatus from '@/ui/PlayersStatus';

export default function GameUi({children, tanks}: {children: React.ReactNode; tanks: Tank[]}) {
	return (
		<>
			<PlayersStatus tanks={tanks}/>
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
