import React from 'react';
import clsx from 'clsx';
import {AnimatePresence, motion} from 'framer-motion';
import {NavLink, Outlet, useLocation} from 'react-router-dom';

export default function Register() {
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
			<nav className='p-2'>
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
				</ul>
			</nav>
			<main>
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
