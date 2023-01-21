import React from 'react';
import clsx from 'clsx';
import {AnimatePresence, motion} from 'framer-motion';
import {NavLink, Outlet, useLocation} from 'react-router-dom';
import Button from '@/ui/Button';
import {usePlayerSettings} from '@/store/store';

export default function Register() {
	const {setMenu} = usePlayerSettings();
	const tabs = [
		{
			label: 'Host Game',
			url: '/',
		},
		{
			label: 'Join Game',
			url: '/join',
		},
	];

	const location = useLocation();

	return (
		<>
			<nav className='p-2 uppercase'>
				<ul className='flex flex-row border-b-4 border-gray-200 dark:border-gray-700'>
					{tabs.map(item => (
						<NavLink
							to={item.url}
							key={item.label}
							className={({isActive}) => clsx(
								isActive && 'bg-white dark:bg-gray-700',
								'relative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-t py-4 text-xl font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700/50 md:text-2xl',
							)}
						>
							{({isActive}) => (
								<>
									{`${item.label}`}
									{isActive && (
										<motion.div
											className='bg-toonks-orange absolute inset-x-0 -bottom-1 h-1 rounded-full'
											layoutId='underline'
										/>
									)}
								</>
							)}
						</NavLink>
					))}
					<button
						onClick={() => {
							setMenu(true);
						}}
						className='bg-toonks-orange relative flex w-16 cursor-pointer flex-col items-center justify-center rounded-t p-2 py-4 text-xl font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700/50 md:text-2xl'
					>
						<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path fill='currentColor' d='M2 6c0-1.505.78-3.08 2-4c0 .845.69 2 2 2a3 3 0 0 1 3 3c0 .386-.079.752-.212 1.091a74.515 74.515 0 0 1 2.191 1.808l-2.08 2.08a75.852 75.852 0 0 1-1.808-2.191A2.977 2.977 0 0 1 6 10c-2.21 0-4-1.79-4-4zm12.152 6.848l1.341-1.341A4.446 4.446 0 0 0 17.5 12A4.5 4.5 0 0 0 22 7.5c0-.725-.188-1.401-.493-2.007L18 9l-2-2l3.507-3.507A4.446 4.446 0 0 0 17.5 3A4.5 4.5 0 0 0 13 7.5c0 .725.188 1.401.493 2.007L3 20l2 2l6.848-6.848a68.562 68.562 0 0 0 5.977 5.449l1.425 1.149l1.5-1.5l-1.149-1.425a68.562 68.562 0 0 0-5.449-5.977z'/></svg>
					</button>
				</ul>
			</nav>
			<main className='p-6 sm:p-8'>
				<AnimatePresence mode='wait'>
					<motion.div
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: 10}}
						transition={{duration: 0.2}}
						key={location.pathname}
					>
						<Outlet />
					</motion.div>
				</AnimatePresence>
			</main>
		</>
	);
}
