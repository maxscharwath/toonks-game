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
	}

	public async joinRoom(roomId: string): Promise<void> {
		return new Promise((resolve, reject) => {
			console.log(`Try to join room ${roomId}`);
			this.peer = new Peer();
			const connection: DataConnection = this.peer.connect(roomId);
			connection.once('open', () => {
				this.emit('connected');
				console.log('connected');
				this.connections.push(connection);
				resolve();
			});
			connection.once('error', err => {
				console.log(err);
				reject(err);
			});
		});
	}

	public async createRoom(roomId: string): Promise<string> {
		return new Promise(resolve => {
			this.peer = new Peer(roomId);
			this.peer.on('connection', connection => {
				console.log('connected');
				this.connections.push(connection);
			});
			this.peer.once('open', id => {
				console.log(`My peer ID is: ${id}`);
				this.emit('connected');
				resolve(id);
			});
		});
	}

	public send(data: any): void {
		this.connections.forEach(connection => {
			connection.send(data);
		});
	}

	public onReceive(callback: (data: any) => void): void {
		this.peer?.on('connection', connection => {
			connection.on('data', data => {
				callback(data);
			});
		});
	}
}
