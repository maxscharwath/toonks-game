import React, {useState} from 'react';
import {useNetwork} from '@/store/store';
import Button from '@/ui/Button';
import PlayerInfosSelection from '@/ui/PlayerInfosSelection';
import {NetworkStatus} from '@game/network/Network';
import {type TankType} from '@game/models/TankType';

export default function HostGameTab() {
	const [name, setName] = useState('Player');
	const [tank, setTank] = useState<TankType>('heig');
	const {status, hostGame} = useNetwork();

	const handleHostGame = () => {
		void hostGame({
			name,
			tank,
		});
	};

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
            Ready to host a game?
			</h2>

			<PlayerInfosSelection
				setName={setName}
				setTank={setTank}
			/>

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
