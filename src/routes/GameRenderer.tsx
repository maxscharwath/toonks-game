import React, {useEffect} from 'react';
import {initGame} from '@game/main';
import {useNetwork} from '@/store/store';
import GameUi from '@/ui/GameUi';
import {toast} from 'react-hot-toast';
import ConnectionToast from '@/ui/toast/ConnectionToast';
import {NetworkStatus} from '@game/network/Network';
import KillToast from '@/ui/toast/KillToast';

export default function GameRenderer() {
	const {network} = useNetwork();
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	useEffect(() => {
		if (!network) {
			window.location.href = '/';
		}

		const {start, stop} = initGame();
		void start(canvasRef.current!, network!).then(async game => {
			network?.on('status', status => {
				if (status === NetworkStatus.Disconnected) {
					console.log('Disconnected from server, redirecting to home page');
					window.location.href = '/';
				}
			});
			network?.on('join', () => {
				toast.custom(<ConnectionToast playerName='Player #1' type='join' />);
			});
			network?.on('leave', () => {
				toast.custom(<ConnectionToast playerName='Player #1' type='leave' />);
			});
			game.events.on('tank:killed', ({killer, killed}) => {
				toast.custom(
					<KillToast killer={killer} killed={killed} />,
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
