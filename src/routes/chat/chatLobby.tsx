import React, {type DetailedHTMLProps, type InputHTMLAttributes, type SetStateAction, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {nanoid} from 'nanoid';
import appLogo from '@/assets/logo.svg';

export default function ChatLobby() {
	const [roomId, setRoomId] = useState('');
	const navigate = useNavigate();

	const handleInputChange = (e: {
		target: {value: SetStateAction<string>};
	}) => {
		setRoomId(e.target.value);
	};

	const createRoom = () => {
		const id = `${nanoid()}`;
		navigate(`/chat/${id}`, {
			state: {
				host: true,
			},
		});
	};

	const connectToRoom = () => {
		if (!roomId) {
			return;
		}

		navigate(`/chat/${roomId}`, {
			state: {
				host: false,
			},
		});
	};

	const handleKeyPressEnter = (event: DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
		if (event.key === 'Enter') {
			connectToRoom();
		}
	};

	return (
		<>
			<section className='bg-gray-50 dark:bg-gray-900'>
				<div className='mx-auto flex flex-col items-center justify-center px-6 py-8 md:h-screen lg:py-0'>
					<div className='mb-6'>
						<img
							src={appLogo}
							alt='test public folder image'
							width='300'
							height='300'
						/>
					</div>
					<div
						className='w-full divide-y-2 rounded-lg bg-white shadow dark:divide-gray-500 dark:border dark:border-gray-700 dark:bg-gray-800 sm:max-w-md md:mt-0 xl:p-0'>
						<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
							<h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
                Join Chat Room
							</h1>
							<div>
								<label
									className='mb-2 block text-sm font-medium text-gray-900 dark:text-white'
								>
                  Room ID
									<input
										type='text'
										className='focus:ring-primary-600 focus:border-primary-600 mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm'
										placeholder='xxxxxx'
										value={roomId}
										onChange={handleInputChange}
										onKeyDown={handleKeyPressEnter}
									/>
								</label>
								<button
									className='bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-toonks-orangeLight bottom-0 mt-auto mr-2 mb-2 w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:scale-105 focus:ring-4'
									onClick={connectToRoom}
								>
                  Join
								</button>
							</div>
						</div>
						<div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
							<h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
                Create Chat Room
							</h1>
							<div>
								<button
									className='bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-toonks-orangeLight bottom-0 mt-auto mr-2 mb-2 w-full rounded-lg px-5 py-2.5 text-sm font-medium text-white hover:scale-105 focus:ring-4'
									onClick={createRoom}
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
