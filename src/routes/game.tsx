import React, {useEffect} from 'react';
import {startGame} from '@game/game';
import {useNetwork} from '@/store/store';
import GameUi from '@/ui/GameUi';

export default function Game() {
	const {network} = useNetwork();
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const game = startGame(canvasRef.current!, network!);
		return () => {
			void game.then((project => {
				project.renderer.dispose();
			}));
		};
	}, []);

	return (
		<GameUi>
			<canvas ref={canvasRef}/>
		</GameUi>
	);
}
