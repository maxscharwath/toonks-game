import {type TankType} from '@game/models/TankType';

export type Metadata = {
	name: string;
	tank: TankType;
};

export type PeerData = {
	uuid: string;
	metadata: Metadata;
};

export type NetworkEvents = {
	join: {peer: PeerData; peers: PeerData[]};
	leave: {peer: PeerData; peers: PeerData[]};
	update: any;
	event: {event: string; data: any};
	chat: {message: string; date: string};
};
