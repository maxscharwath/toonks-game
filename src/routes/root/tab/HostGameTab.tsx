import React, {useState} from 'react';
import {useNetwork, usePlayerSettings} from '@/store/store';
import Button from '@/ui/Button';
import PlayerInfosSelection from '@/ui/PlayerInfosSelection';
import {NetworkStatus} from '@game/network/Network';
import {type TankType} from '@game/models/TankType';

export default function HostGameTab() {
	const {status, hostGame} = useNetwork();
	const {name, tank} = usePlayerSettings();

	const handleHostGame = () => {
		void hostGame({
			name,
			tank,
		});
	};

	return (
		<div className='space-y-4 md:space-y-6'>
			<h2 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
            Ready to host a game?
			</h2>

			<Button
				onClick={handleHostGame}
				loading={status === NetworkStatus.Connecting}
				fullWidth
				size='large'
			>
            Create
			</Button>
		</div>
	);
}
