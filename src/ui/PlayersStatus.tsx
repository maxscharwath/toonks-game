import type Tank from '@game/models/Tank';
import React, {useEffect} from 'react';

export default function PlayersStatus({tanks}: {tanks: Tank[]}) {
	const [tanksState, setTanksState] = React.useState(tanks);

	useEffect(() => {
		const interval = setInterval(() => {
			setTanksState(tanks);
		}, 100);
		return () => {
			clearInterval(interval);
		};
	}, []);

	return (
		<div className='absolute top-0 left-0 z-10 m-10'>
			{tanksState.map(tank => (
				<div className='text-xl text-white' key={tank.uuid}>
					<span>{tank.pseudo} : </span> <span>{tank.health}</span>
				</div>
			))}
		</div>
	);
}
