import React, {useState} from 'react';
import {type Tank} from '@/models';
import {useNetwork} from '@/store/store';
import Button from '@/ui/Button';
import PlayerInfosSelection from '@/ui/PlayerInfosSelection';
import {NetworkStatus} from '@game/network/Network';
import CodeInput from '@/ui/CodeInput';

type Props = {
	tanks: Tank[];
};

export default function JoinGameTab({tanks}: Props) {
	const {status, joinGame} = useNetwork();
	const [code, setCode] = useState('');
	const [name, setName] = useState('Player');
	const [selectedTankIndex, setSelectedTankIndex] = useState(0);

	const selectedTank = (): Tank => tanks[selectedTankIndex];

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
            Enter Game ID
			</h2>
			<CodeInput
				onChange={c => {
					setCode(c);
				}}
				length={6}
				className='mb-5'
			/>

			<PlayerInfosSelection
				tanks={tanks}
				playerName={name}
				tankIndex={selectedTankIndex}
				onNameChange={setName}
				onTankChange={setSelectedTankIndex}
			/>

			<Button
				onClick={() => {
					void joinGame(code, {
						name,
						tank: selectedTank(),
					});
				}}
				loading={status === NetworkStatus.Connecting}
				disabled={code.length !== 6}
				fullWidth
				size='large'
			>
            Join
			</Button>
		</div>
	);
}
