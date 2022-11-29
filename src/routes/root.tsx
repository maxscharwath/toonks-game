import React, {type DetailedHTMLProps, type InputHTMLAttributes, type SetStateAction, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {nanoid} from 'nanoid';
import appLogo from '@/assets/logo.svg';
export default function Root() {
	const [gameId, setGameId] = useState('');
	const navigate = useNavigate();

	const handleInputChange = (e: {
		target: {value: SetStateAction<string>};
	}) => {
		setGameId(e.target.value);
	};

	const createGame = () => {
		const id = `toonks-${nanoid()}`;
		navigate(`/game/${id}`, {
			state: {
				host: true,
			},
		});
	};

	const connectToGame = () => {
		if (!gameId) {
			return;
		}

		navigate(`/game/${gameId}`, {
			state: {
				host: false,
			},
		});
	};

	const handleKeyPressEnter = (event: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
		if (event.key === 'Enter') {
			connectToGame();
		}
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
								<input
									type='text'
									name='gameId'
									id='gameId'
									className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4'
									placeholder='toonks-xxxxxx'
									value={gameId}
									onChange={handleInputChange}
									onKeyDown={handleKeyPressEnter}
								/>
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
