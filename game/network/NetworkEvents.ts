export type NetworkEvents = {
	join: {uuid: string; peers: string[]};
	leave: {uuid: string; peers: string[]};
	update: any;
	event: {event: string; data: any};
};
