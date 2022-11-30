import Peer, {type DataConnection} from 'peerjs';
import Emittery from 'emittery';

type NetworkEvents = {
	newConnection: DataConnection;
	removeConnection: DataConnection;
	data: {connection: DataConnection; data: any};
};

export default class Network extends Emittery<NetworkEvents> {
	public static getInstance(): Network {
		if (!Network.instance) {
			Network.instance = new Network();
		}

		return Network.instance;
	}

	private static instance: Network;

	private readonly connections: DataConnection[] = [];
	private peer?: Peer;

	private host = false;

	private constructor() {
		super();
	}

	public async joinRoom(roomId: string): Promise<void> {
		this.host = false;
		return new Promise((resolve, reject) => {
			console.log(`Try to join room ${roomId}`);
			this.peer = new Peer();
			this.peer.once('open', id => {
				console.log(`My peer ID is: ${id}`);
				const connection: DataConnection = this.peer!.connect(roomId, {reliable: true});
				connection.once('open', async () => {
					await this.addConnection(connection);
					resolve();
				});
				connection.once('error', reject);
			});
		});
	}

	public async createRoom(roomId: string): Promise<string> {
		this.host = true;
		return new Promise(resolve => {
			this.peer = new Peer(roomId);
			this.peer.on('connection', async connection => {
				await this.addConnection(connection);
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

	private async removeConnection(connection: DataConnection): Promise<void> {
		connection.removeAllListeners();
		this.connections.splice(this.connections.indexOf(connection), 1);
		await this.emit('removeConnection', connection);
	}

	private broadcast(data: any, exclude?: DataConnection): void {
		this.connections.forEach(connection => {
			if (connection !== exclude) {
				connection.send(data);
			}
		});
	}

	private async addConnection(connection: DataConnection): Promise<void> {
		this.connections.push(connection);
		await this.emit('newConnection', connection);
		connection.once('close', async () => {
			await this.removeConnection(connection);
		});
		connection.on('data', async data => {
			console.log('Received', data, 'from', connection.peer);
			if (this.host) {
				this.broadcast(data, connection);
			}

			await this.emit('data', {
				connection,
				data,
			});
		});
	}
}
