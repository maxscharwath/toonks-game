import React, {useState} from 'react';
import CodeInput from '@/ui/CodeInput';
import clsx from 'clsx';
import {AnimatePresence, motion} from 'framer-motion';
import Button from '@/ui/Button';
import {useNetwork} from '@/store/store';
import {NetworkStatus} from '@game/network/Network';

export default function Register() {
	const tabs = [
		{
			label: 'Host Game',
			content() {
				const {status, hostGame} = useNetwork();
				return <div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
					<h2
						className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
                        Ready to host a game?
					</h2>
					<Button onClick={hostGame} loading={status === NetworkStatus.Connecting} fullWidth size='large'>
                        Create
					</Button>
				</div>;
			},
		},
		{
			label: 'Join Game',
			content() {
				const {status, joinGame} = useNetwork();
				const [code, setCode] = useState('');
				return <div className='space-y-4 p-6 sm:p-8 md:space-y-6'>
					<h2
						className='text-center text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-2xl'>
                        Enter Game ID
					</h2>
					<CodeInput onChange={c => {
						setCode(c);
					}} length={6} className='mb-5'/>
					<Button
						onClick={() => {
							void joinGame(code);
						}}
						loading={status === NetworkStatus.Connecting}
						disabled={code.length !== 6}
						fullWidth
						size='large'
					>
                        Join
					</Button>
				</div>;
			},
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
								className={clsx(isSelected && 'bg-gray-700', 'relative flex flex-1 cursor-pointer flex-col items-center justify-center rounded-t py-4 text-xl font-bold text-gray-900 transition-colors duration-200 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700/50 md:text-2xl')}
								onClick={() => {
									setSelectedTab(item);
								}}
							>
								{`${item.label}`}
								{isSelected && (
									<motion.div
										className='bg-toonks-orange absolute inset-x-0 -bottom-1 h-1 rounded-full'
										layoutId='underline'/>
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
						<selectedTab.content/>
					</motion.div>
				</AnimatePresence>
			</main>
		</>
	);
}
