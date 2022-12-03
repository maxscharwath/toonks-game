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
								Join Chat Room
							</h1>
							<div>
								<label
									className='block mb-2 text-sm font-medium text-gray-900 dark:text-white'
								>
									Room ID
									<input
										type='text'
										className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-4'
										placeholder='xxxxxx'
										value={roomId}
										onChange={handleInputChange}
										onKeyDown={handleKeyPressEnter}
									/>
								</label>
								<button
									className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
									onClick={connectToRoom}
								>
									Join
								</button>
							</div>
						</div>
						<div className='p-6 space-y-4 md:space-y-6 sm:p-8'>
							<h1 className='text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white'>
								Create Chat Room
							</h1>
							<div>
								<button
									className='w-full bottom-0 mt-auto text-white bg-toonks-orange hover:bg-toonks-orangeLight focus:ring-4 focus:ring-toonks-orangeLight font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 hover:scale-105'
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
