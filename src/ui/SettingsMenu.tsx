import {useAudio} from '@/store/store';
import React, {useState} from 'react';
import Button from './Button';

export default function SettingsMenu() {
	const [open, setOpen] = useState(false);
	const audio = useAudio();

	return (
		<>
			<Button
				size='small'
				onClick={() => {
					setOpen(!open);
				}}
			>
				<svg
					className='h-4 w-4'
					fill='none'
					stroke='currentColor'
					strokeWidth='1.5'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
					aria-hidden='true'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						d='M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z'
					></path>
					<path strokeLinecap='round' strokeLinejoin='round' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'></path>
				</svg>{' '}
				<svg
					className='ml-2 h-4 w-4'
					aria-hidden='true'
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
					xmlns='http://www.w3.org/2000/svg'
				>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'></path>
				</svg>
			</Button>

			{open && (
				<div className='z-10 mt-1 w-48 divide-y-2 rounded bg-white shadow dark:divide-gray-600 dark:bg-gray-700'>
					<ul className='space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200'>
						<li>
							<div className='flex items-center hover:bg-gray-100 dark:hover:bg-gray-600'>
								<input
									id='mute'
									type='checkbox'
									defaultChecked={audio.mute}
									className='accent-toonks-orange text-toonks-orange focus:ring-toonks-orangeLight dark:ring-toonks-orange dark:focus:ring-toonks-orange h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 focus:ring-2 dark:border-gray-500 dark:bg-gray-600 dark:focus:ring-offset-gray-700'
									onChange={() => {
										audio.toggleBacksound();
									}}
								/>
								<label
									htmlFor='mute'
									className='ml-2 w-full cursor-pointer rounded text-sm font-medium text-gray-900 dark:text-gray-300'
								>
                           Mute
								</label>
							</div>
						</li>
					</ul>
					<ul className='space-y-1 p-3 text-sm text-gray-700 dark:text-gray-200'>
						<li>
							<input
								type='range'
								min='0'
								max='1'
								defaultValue={audio.volume}
								step='0.01'
								className='accent-toonks-orange h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200'
								onChange={e => {
									audio.setBacksoundVolume(parseFloat(e.target.value));
								}}
							/>
						</li>
					</ul>
				</div>
			)}
		</>
	);
}
