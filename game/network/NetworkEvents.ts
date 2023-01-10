export type PeerData = {
	uuid: string;
	metadata: {
		name: string;
	};
};

export type NetworkEvents = {
	join: {peer: PeerData; peers: PeerData[]};
	leave: {peer: PeerData; peers: PeerData[]};
	update: any;
	event: {event: string; data: any};
};
