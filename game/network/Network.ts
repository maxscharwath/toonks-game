import Peer, {type DataConnection} from 'peerjs';
import EventEmitter from 'eventemitter3';

export default class Network extends EventEmitter {
	private static instance: Network;
	private peer?: Peer;

	private readonly connections: DataConnection[] = [];
	public static getInstance(): Network {
		if (!Network.instance) {
			Network.instance = new Network();
		}

		return Network.instance;
	}

	private constructor() {
		super();
		this.on('connection', (connection: DataConnection) => {
			connection.on('data', data => {
				console.log('Received', data, 'from', connection.peer);
				this.emit('data', data);
			});
		});
	}

	public async joinRoom(roomId: string): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log(`Try to join room ${roomId}`);
			this.peer = new Peer();
			this.peer.on('open', id => {
				console.log(`My peer ID is: ${id}`);
				const connection: DataConnection = this.peer!.connect(roomId, {reliable: true});
				connection.on('open', () => {
					this.emit('connection', connection);
					this.connections.push(connection);
					resolve();
				});
				connection.on('error', err => {
					console.log(err);
					reject(err);
				});
			});
		});
	}

	public async createRoom(roomId: string): Promise<string> {
		return new Promise(resolve => {
			this.peer = new Peer(roomId);
			this.peer.on('connection', connection => {
				this.emit('connection', connection);
				this.connections.push(connection);
			});
			this.peer.on('open', id => {
				console.log(`My peer ID is: ${id}`);
				resolve(id);
			});
		});
	}

	public send(data: any): void {
		this.connections.forEach(connection => {
			connection.send(data);
		});
	}
}
