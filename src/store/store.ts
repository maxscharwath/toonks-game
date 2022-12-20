import create from 'zustand';
import {Network, NetworkStatus} from '@game/network/Network';
import {ClientNetwork} from '@game/network/ClientNetwork';
import {ServerNetwork} from '@game/network/ServerNetwork';
import {type NetworkEvents} from '@game/network/NetworkEvents';

type Store = {
	hostGame: () => Promise<{code: string; network: ServerNetwork}>;
	joinGame: (code: string) => Promise<{code: string; network: ClientNetwork}>;
	code?: string;
	network?: Network<NetworkEvents>;
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

	return {
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
	};
});
