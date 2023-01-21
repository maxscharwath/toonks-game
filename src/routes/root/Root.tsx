import React, {useEffect, useState} from 'react';
import Logo from '@/ui/Logo';
import Register from '@/routes/root/Register';
import {useAudio, useNetwork} from '@/store/store';
import {NetworkStatus} from '@game/network/Network';
import Connected from '@/routes/root/Connected';
import Confetti from '@/ui/Confetti';
import SettingsMenu from '@/ui/SettingsMenu';

function useToggleTimeout(initial: boolean, timeout: number) {
	const [value, setValue] = useState(initial);
	const timeoutRef = React.useRef<number>();
	const toggle = React.useCallback(() => {
		setValue(true);
		clearTimeout(timeoutRef.current);
		timeoutRef.current = setTimeout(() => {
			setValue(false);
		}, timeout) as unknown as number;
	}, [timeout]);
	return [value, toggle] as const;
}

export default function Root() {
	const {status} = useNetwork();
	const [confetti, toggleConfetti] = useToggleTimeout(false, 2000);
	const audio = useAudio();

	useEffect(() => {
		audio.backsound.play();
	}, []);

	useEffect(() => {
		if (status === NetworkStatus.Connected) {
			toggleConfetti();
		}
	}, [status]);

	return (
		<>
			<Confetti active={confetti}/>
			<div className='mx-auto flex flex-col items-center px-6 py-8 md:h-screen lg:py-0'>
				<div className='my-6'>
					<Logo/>
				</div>
				<div
					className='w-full rounded-lg bg-white/90 shadow backdrop-blur dark:border dark:border-gray-700 dark:bg-gray-800/90 sm:max-w-xl md:mt-0 xl:p-0'>
					{status === NetworkStatus.Connected ? <Connected/> : <Register/>}
				</div>

				<div className='fixed top-2 left-2'>
					<SettingsMenu />
				</div>
			</div>
		</>
	);
}
