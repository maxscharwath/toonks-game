import React, {useEffect} from 'react';
import {initGame} from '@game/main';
import {useNetwork} from '@/store/store';
import GameUi from '@/ui/GameUi';
import {toast} from 'react-hot-toast';
import ConnectionToast from '@/ui/toast/ConnectionToast';

export default function GameRenderer() {
	const {network} = useNetwork();
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		const {start, stop} = initGame();
		void start(canvasRef.current!, network!).then(async game => {
			game.events.on('tank:shoot', () => {
				toast.custom(
					<ConnectionToast playerName='Player #1' type='leave' />,
				);
			});
		});
		return () => {
			stop();
		};
	}, []);

	return (
		<GameUi>
			<canvas ref={canvasRef}/>
		</GameUi>
	);
}
