import React, {useState} from 'react';
import {type Tank} from '@/models';
import {useNetwork} from '@/store/store';
import Button from '@/ui/Button';
import PlayerInfosSelection from '@/ui/PlayerInfosSelection';
import {NetworkStatus} from '@game/network/Network';

type Props = {
	tanks: Tank[];
};

export default function HostGameTab({tanks}: Props) {
	const [name, setName] = useState('Player');
	const [selectedTankIndex, setSelectedTankIndex] = useState(0);
	const {status, hostGame} = useNetwork();

	const selectedTank = (): Tank => tanks[selectedTankIndex];

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
            Ready to host a game?
			</h2>

			<PlayerInfosSelection
				tanks={tanks}
				playerName={name}
				tankIndex={selectedTankIndex}
				onNameChange={setName}
				onTankChange={setSelectedTankIndex}
			/>

			<Button
				onClick={async () => hostGame({
					name,
					tank: selectedTank(),
				})}
				loading={status === NetworkStatus.Connecting}
				fullWidth
				size='large'
			>
            Create
			</Button>
		</div>
	);
}
