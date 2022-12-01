import React, {type DetailedHTMLProps, type InputHTMLAttributes, type SetStateAction, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import appLogo from '@/assets/logo.svg';
import Network from '@game/network/Network';
import IdInput from '@/ui/IdInput';
export default function Root() {
	const [gameId, setGameId] = useState('');
	const navigate = useNavigate();

	const createGame = () => {
		const id = Network.generateRoomId({length: 6, prefix: 'TOONKS'});
		console.log('createGame', id);
		Network.getInstance().createRoom(id)
			.then(console.log)
			.catch(console.error);
	};

	const connectToGame = () => {
		if (!gameId) {
			return;
		}

		const id = Network.generateRoomId({length: 6, prefix: 'TOONKS', value: gameId});
		Network.getInstance().joinRoom(id)
			.then(console.log)
			.catch(error => {
				console.log('Error joining room', error);
			});
	};

	return (
		<>
			<section className='bg-gray-50 dark:bg-gray-900'>
				<div className='flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0'>
					<div className='mb-6'>
						<img
							src={appLogo}
							alt='test public folder image'
							width='300'
							height='300'
						/>
					</div>
					<div className='w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700 divide-y-2 dark:divide-gray-500'>
						<div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
							<h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
								Join game
							</h1>
							<div>
								<label
									htmlFor='email'
									className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
								>
									Game ID
								</label>
								<IdInput onChange={setGameId} className='mb-2' />
								<button
									className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
									onClick={connectToGame}
								>
									Join
								</button>
							</div>
						</div>
						<div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
							<h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
								Create game
							</h1>
							<div>
								<button
									className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
									onClick={createGame}
								>
									Create
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
