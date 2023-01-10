import React, {useState} from 'react';
import clsx from 'clsx';
import {AnimatePresence, motion} from 'framer-motion';
import {type Tank} from '@/models';
import HostGameTab from './HostGameTab';
import JoinGameTab from './JoinGameTab';

export default function Register() {
	const availableTanks: Tank[] = [
		{
			name: 'HEIG',
			meshUrl: 'images/tank/heig.png',
		},
		{
			name: 'Military',
			meshUrl: 'images/tank/military.png',
		},
		{
			name: 'StudyStorm',
			meshUrl: 'images/tank/studystorm.png',
		},
		{
			name: 'Weeb',
			meshUrl: 'images/tank/weeb.png',
		},
	];

	const tabs = [
		{
			label: 'Host Game',
			component: HostGameTab,
		},
		{
			label: 'Join Game',
			component: JoinGameTab,
		},
	];
	const [selectedTab, setSelectedTab] = useState(tabs[0]);

	return (
		<>
			<nav className='p-2'>
				<ul className='flex flex-row border-b-4 border-gray-200 dark:border-gray-700'>
					{tabs.map(item => {
						const isSelected = selectedTab.label === item.label;
						return (
							<li
								key={item.label}
								className={clsx(
									isSelected && 'bg-white dark:bg-gray-700',
									'relative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-t py-4 text-xl font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700/50 md:text-2xl',
								)}
								onClick={() => {
									setSelectedTab(item);
								}}
							>
								{`${item.label}`}
								{isSelected && (
									<motion.div
										className='bg-toonks-orange absolute inset-x-0 -bottom-1 h-1 rounded-full'
										layoutId='underline'
									/>
								)}
							</li>
						);
					})}
				</ul>
			</nav>
			<main>
				<AnimatePresence mode='wait'>
					<motion.div
						key={selectedTab.label ?? 'default'}
						initial={{opacity: 0, y: 10}}
						animate={{opacity: 1, y: 0}}
						exit={{opacity: 0, y: 10}}
						transition={{duration: 0.2}}
					>
						<selectedTab.component tanks={availableTanks}/>
					</motion.div>
				</AnimatePresence>
			</main>
		</>
	);
}
