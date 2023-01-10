import create from 'zustand';
import {Network, NetworkStatus} from '@game/network/Network';
import {ClientNetwork} from '@game/network/ClientNetwork';
import {ServerNetwork} from '@game/network/ServerNetwork';
import {type NetworkEvents} from '@game/network/NetworkEvents';

type Store = {
	hostGame: (metadata: any) => Promise<{code: string; network: ServerNetwork}>;
	joinGame: (code: string, metadata: any) => Promise<{code: string; network: ClientNetwork}>;
	code?: string;
	network?: Network<NetworkEvents>;
	status: NetworkStatus;
	peers: string[];
};

export const useNetwork = create<Store>((set, get) => {
	function switchNetwork<T extends Network<NetworkEvents>>(network: T): T {
		const oldNetwork = get().network;
		oldNetwork?.clearListeners();
		oldNetwork?.disconnect();
		network.on('peers', peers => {
			set({peers});
		});
		network.on('status', status => {
			set({status});
		});
		set({network});
		return network;
	}

	return {
		status: NetworkStatus.Disconnected,
		peers: [],
		async hostGame(metadata) {
			console.log(metadata);
			const {full, code} = Network.createRoomId({prefix: 'TOONKS', length: 6});
			const network = switchNetwork(new ServerNetwork(full));
			await network.connect();
			set({code});
			return {network, code};
		},
		async joinGame(code, metadata) {
			console.log(metadata);
			const network = switchNetwork(new ClientNetwork({}));
			await network.connect(Network.createRoomId({prefix: 'TOONKS', value: code}).full);
			set({code});
			return {network, code};
		},
	};
});
