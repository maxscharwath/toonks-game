import React, {useEffect, useState} from 'react';
import {useNetwork} from '@/store/store';
import Button from '@/ui/Button';
import PlayerInfosSelection from '@/ui/PlayerInfosSelection';
import {NetworkStatus} from '@game/network/Network';
import CodeInput from '@/ui/CodeInput';
import {type TankType} from '@game/models/TankType';
import {useParams} from 'react-router-dom';

export default function JoinGameTab() {
	const {status, joinGame} = useNetwork();
	const params = useParams<{code?: string}>();
	const [code, setCode] = useState('');
	const [name, setName] = useState('Player');
	const [tank, setTank] = useState<TankType>('heig');

	useEffect(() => {
		if (params.code) {
			setCode(params.code);
		}
	}, [params.code]);

	const handleJoinGame = () => {
		void joinGame(code, {
			name,
			tank,
		});
	};

	return (
		<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
			<h2 className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
            Enter Game ID
			</h2>
			<CodeInput
				value={code}
				onChange={setCode}
				length={6}
				className='mb-5'
			/>

			<PlayerInfosSelection
				setName={setName}
				setTank={setTank}
			/>

			<Button
				onClick={handleJoinGame}
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
