import Conf from 'react-confetti';
import React, {useEffect, useState} from 'react';
import {useWindowSize} from 'react-use';

type Props = {
	quantity?: number;
	active: boolean;
};

export default function Confetti({active, quantity}: Props) {
	const [run, setRun] = useState(false);

	const {width, height} = useWindowSize();

	useEffect(() => {
		if (active) {
			setRun(true);
		}
	}, [active]);

	const handleConfettiComplete = () => {
		setRun(false);
	};

	return (
		<>
			{run && <Conf
				width={width}
				height={height}
				numberOfPieces={active ? quantity ?? 200 : 0}
				className='fixed top-0 left-0 h-full w-full'
				onConfettiComplete={handleConfettiComplete}
			/>}
		</>
	);
}
