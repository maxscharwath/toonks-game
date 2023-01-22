import React, {useRef, useState} from 'react';
import Modal from 'react-modal';
import Logo from '@/ui/Logo';

function KBD(props: {children: React.ReactNode}) {
	return (
		<kbd
			className='rounded bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-800 shadow-sm ring-1 ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:ring-gray-600'
		>
			{props.children}
		</kbd>
	);
}

export default function Credits({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
	const credits = useRef([
		{name: 'Crausaz Nicolas', linkedin: 'https://www.linkedin.com/in/nicolas-crausaz-861876104/', github: 'https://github.com/nicrausaz'},
		{name: 'Pavicevic Lazar', linkedin: 'https://www.linkedin.com/in/lazar-pavicevic/', github: 'https://github.com/Lazzzer'},
		{name: 'Scharwath Maxime', linkedin: 'https://www.linkedin.com/in/maximescharwath/', github: 'https://github.com/maxscharwath'},
	]);

	return (
		<Modal
			isOpen={isOpen}
			shouldCloseOnOverlayClick={true}
			onRequestClose={onClose}
			overlayClassName='fixed inset-0 flex h-full w-full items-center justify-center bg-black/50 p-4 backdrop-blur'
			className='flex max-h-full w-full max-w-2xl flex-col items-center space-y-4 overflow-auto rounded-lg border-2 border-gray-300 bg-white p-4 shadow dark:border-gray-600 dark:bg-gray-800'
		>
			<Logo style={{width: 125, height: 125}}/>
			<div className='w-full space-y-4 p-4'>
				<div className=' flex flex-col items-center space-y-2'>
					<h2 className='text-xl font-bold text-gray-800 dark:text-gray-200'>A game made by</h2>
					<ul className='flex w-full flex-row justify-center text-gray-600 dark:text-gray-300'>
						{credits.current.map(credit => (
							<li key={credit.name} className='m-1 flex flex-1 flex-col items-center space-y-1 rounded-lg bg-gray-100 p-2 dark:bg-gray-700'>
								<div className='text-center font-bold'>{credit.name}</div>
								<div className='flex flex-row gap-2'>
									<a href={credit.linkedin} target='_blank' rel='noreferrer' className='h-6 w-6 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500'>
										<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77Z'/></svg>
									</a>
									<a href={credit.github} target='_blank' rel='noreferrer' className='h-6 w-6 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-500'>
										<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='currentColor' d='M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z'/></svg>
									</a>
								</div>
							</li>
						))}
					</ul>
				</div>

				<hr className='border-1 m-auto w-2/3 border-gray-300 dark:border-gray-600'/>

				<div className='space-y-2 text-gray-600 dark:text-gray-300'>
					<h2 className='text-lg font-bold'>Controls</h2>
					<p className='text-gray-600 dark:text-gray-300'>
						<ul className='list-inside list-disc space-y-2'>
							<li>Move with <span className='mx-2'><KBD>W</KBD> <KBD>A</KBD> <KBD>S</KBD> <KBD>D</KBD></span></li>
							<li>Shoot with <span className='mx-2'><KBD>Space</KBD></span></li>
							<li>Open chat with <span className='mx-2'><KBD>Tab</KBD></span></li>
							<li>Honk with <span className='mx-2'><KBD>K</KBD></span></li>
							<li>Toggle headlights with <span className='mx-2'><KBD>L</KBD></span></li>
							<li>Increment canon angle with <span className='mx-2'><KBD>Mouse Scroll</KBD></span></li>
							<li>Respawn or unlock your tank with <span className='mx-2'><KBD>R</KBD></span></li>
						</ul>
					</p>
				</div>

				<hr className='border-1 m-auto w-2/3 border-gray-300 dark:border-gray-600'/>

				<div className='space-y-2 text-gray-600 dark:text-gray-300'>
					<h2 className='text-lg font-bold'>Technologies</h2>
					<ul className='grid list-inside list-disc grid-cols-3 gap-2'>
						<li>React</li>
						<li>TypeScript</li>
						<li>PeerJS</li>
						<li>Enable3D</li>
						<li>ThreeJS</li>
						<li>HowlerJS</li>
						<li>React-Three-Fiber</li>
						<li>Framer-Motion</li>
						<li>Vite</li>
					</ul>
				</div>

				<hr className='border-1 m-auto w-2/3 border-gray-300 dark:border-gray-600'/>

				<div className='space-y-2 text-gray-600 dark:text-gray-300'>
					<h2 className='text-lg font-bold'>Information</h2>
					<p>
						For the moment, please play only with Chromium-based browsers (Chrome, Edge, Opera, Brave, Vivaldi, etc.).
						This game is not compatible with Firefox and Safari.
					</p>
					<p>
						For the best experience, please use a powerful computer with a good internet connection.
					</p>
					<p>
						This game use WebRTC to connect players. Your IP can be leaked if you play with a VPN.
					</p>
					<p>
						We are not responsible for any damage caused by this game. Please play responsibly.
					</p>
				</div>

				<hr className='border-1 m-auto w-2/3 border-gray-300 dark:border-gray-600'/>

				<div className='space-y-2 text-gray-600 dark:text-gray-300'>
					<h2 className='text-lg font-bold'>Code on GitHub</h2>
					<a href='https://github.com/maxscharwath/toonks-game' className='flex flex-row items-center space-x-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200'>
						<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path fill='currentColor' d='M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z'/></svg>
									GitHub
					</a>
				</div>
			</div>
		</Modal>
	);
}
