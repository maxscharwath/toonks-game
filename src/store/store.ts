import create from 'zustand';
import {Network, NetworkStatus} from '@game/network/Network';
import {ClientNetwork} from '@game/network/ClientNetwork';
import {ServerNetwork} from '@game/network/ServerNetwork';
import {type Metadata, type NetworkEvents, type PeerData} from '@game/network/NetworkEvents';
import {Howl} from 'howler';

type Store = {
	hostGame: (metadata: Metadata) => Promise<{code: string; network: ServerNetwork}>;
	joinGame: (code: string, metadata: Metadata) => Promise<{code: string; network: ClientNetwork}>;
	code?: string;
	network?: Network<NetworkEvents, Metadata>;
	status: NetworkStatus;
	peers: PeerData[];
	readonly maxNbPlayers: number;
};

export const useNetwork = create<Store>((set, get) => {
	function switchNetwork<T extends Network<NetworkEvents, Metadata>>(network: T): T {
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
		async hostGame(metadata: Metadata) {
			const {full, code} = Network.createRoomId({prefix: 'TOONKS', length: 6});
			const network = switchNetwork(new ServerNetwork(full));

			network.setHandleConnection(() => network.getConnections().length + 1 < get().maxNbPlayers);

			await network.connect({
				metadata,
			});
			set({code});
			return {network, code};
		},
		async joinGame(code, metadata: Metadata) {
			const network = switchNetwork(new ClientNetwork());
			await network.connect({
				id: Network.createRoomId({prefix: 'TOONKS', value: code}).full,
				metadata,
			});

			set({code});
			return {network, code};
		},
		maxNbPlayers: 6,
	};
});

export const useAudio = create<{
	backsound: Howl;
}>(() => ({
	backsound: new Howl({
		src: ['/audio/Eyes_on_the_Podium.mp3'],
		volume: 0.5,
	}),
}));
