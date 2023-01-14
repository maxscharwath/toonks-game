import React, {useEffect} from 'react';
import {initGame} from '@game/main';
import {useNetwork} from '@/store/store';
import GameUi from '@/ui/GameUi';
import {toast} from 'react-hot-toast';
import ConnectionToast from '@/ui/toast/ConnectionToast';
import {NetworkStatus} from '@game/network/Network';
import KillToast from '@/ui/toast/KillToast';
import HitToast from '@/ui/toast/HitToast';
import type Game from '@game/scenes/Game';

export default function GameRenderer() {
	const {network} = useNetwork();
	const [game, setGame] = React.useState<Game>();
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!network) {
			window.location.href = '/';
		}

		const {start, stop} = initGame();
		void start(canvasRef.current!, network!).then(async game => {
			setGame(game);
			network?.on('status', status => {
				if (status === NetworkStatus.Disconnected) {
					console.log('Disconnected from server, redirecting to home page');
					window.location.href = '/';
				}
			});
			network?.on('join', name => {
				toast.custom(<ConnectionToast playerName={name} type='join' />);
			});
			network?.on('leave', name => {
				toast.custom(<ConnectionToast playerName={name} type='leave' />);
			});
			game.events.on('tank:kill', ({killer, killed}) => {
				toast.custom(
					<KillToast killer={killer} killed={killed} />,
				);
			});
			game.events.on('tank:hit', ({from, to, damage}) => {
				const playerA = game.tanks.get(from)?.pseudo ?? 'Unknown';
				const playerB = game.tanks.get(to)?.pseudo ?? 'Unknown';
				toast.custom(
					<HitToast from={playerA} to={playerB} damage={damage} />,
				);
			});
		});
		return () => {
			stop();
		};
	}, []);

	return (
		<div>
			<canvas ref={canvasRef} key='game-canvas' />
			{game && <GameUi game={game} />}
		</div>
	);
}
