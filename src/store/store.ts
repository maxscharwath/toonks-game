import create from 'zustand';
import {ClientNetwork, Network, NetworkStatus, ServerNetwork} from '@game/network/Network';

type Store = {
	hostGame: () => Promise<{code: string; network: ServerNetwork}>;
	joinGame: (code: string) => Promise<{code: string; network: ClientNetwork}>;
	code?: string;
	network?: Network;
	status: NetworkStatus;
};

export const useNetwork = create<Store>((set, get) => {
	function switchNetwork<T extends Network>(network: T): T {
		get().network?.disconnect();
		network.on('status', status => {
			set({status});
		});
		set({network});
		return network;
	}

	return ({
		status: NetworkStatus.Disconnected,
		async hostGame() {
			const {full, code} = Network.createRoomId({prefix: 'TOONKS', length: 6});
			const network = switchNetwork(new ServerNetwork(full));
			await network.connect();
			set({code});
			return {network, code};
		},
		async joinGame(code) {
			const network = switchNetwork(new ClientNetwork({}));
			await network.connect(Network.createRoomId({prefix: 'TOONKS', value: code}).full);
			set({code});
			return {network, code};
		},
	});
});
