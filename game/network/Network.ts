import Peer, {type DataConnection} from 'peerjs';
import Emittery from 'emittery';

type NetworkEvents = {
	connected: string;
	disconnected: never;
	newConnection: DataConnection;
	removeConnection: DataConnection;
	status: NetworkStatus;
	data: {connection: DataConnection; data: any};
};

export enum NetworkStatus {
	Disconnected = 'disconnected',
	Connecting = 'connecting',
	Connected = 'connected',
}

/**
 * Singleton class for managing network connections
 */
export default class Network extends Emittery<NetworkEvents> {
	public static getInstance(): Network {
		if (!Network.instance) {
			Network.instance = new Network();
		}

		return Network.instance;
	}

	public static generateRoomId(options: Partial<{length: number; prefix: string; value: string}>): string {
		const {length = 6, prefix = '', value} = options;
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const id = value ?? Array.from({length}, () => alphabet.at(Math.floor(Math.random() * alphabet.length))).join('');
		return [Network.UNIQUE_PREFIX, prefix, id].filter(Boolean).join('-');
	}

	public static parseRoomId(roomId: string): string | undefined {
		const parts = roomId.split('-');
		if (parts[0] !== Network.UNIQUE_PREFIX) {
			return;
		}

		return parts.at(-1);
	}

	private static get UNIQUE_PREFIX() {
		return 'SWNpT25Fc3REZXNDcmFja3M';
	}

	private static instance: Network;
	private connections: DataConnection[] = [];
	private peer?: Peer;
	private host = false;
	private status = NetworkStatus.Disconnected;

	private constructor() {
		super();
	}

	/**
	 * Joins an existing room.
	 * @param roomId - The room id to join.
	 */
	public async joinRoom(roomId: string): Promise<void> {
		this.host = false;
		this.disconnect();
		return new Promise((resolve, reject) => {
			this.peer = new Peer();
			console.log('Joining room', roomId);
			this.peer
				.once('open', id => {
					console.log('Joined room', roomId, 'as', id);
					this.setStatus(NetworkStatus.Connecting);
					const connection: DataConnection = this.peer!.connect(roomId, {reliable: true, metadata: {username: 'test'}});
					connection
						.once('open', () => {
							this.setStatus(NetworkStatus.Connected);
							void this.emit('connected', id);
							this.addConnection(connection);
							resolve();
						});
				})
				.once('error', error => {
					this.setStatus(NetworkStatus.Disconnected);
					reject(error);
				})
				.once('disconnected', () => {
					this.setStatus(NetworkStatus.Disconnected);
					void this.emit('disconnected');
				});
		});
	}

	/**
	 * Creates a new room and returns the room id.
	 * @param roomId - The room id to create.
	 */
	public async createRoom(roomId: string): Promise<string> {
		this.host = true;
		this.disconnect();
		return new Promise(resolve => {
			this.setStatus(NetworkStatus.Connecting);

			this.peer = new Peer(roomId);

			this.peer
				.on('connection', connection => {
					this.addConnection(connection);
				})
				.once('open', id => {
					this.setStatus(NetworkStatus.Connected);
					void this.emit('connected', id);
					resolve(id);
				})
				.once('disconnected', () => {
					this.setStatus(NetworkStatus.Disconnected);
					void this.emit('disconnected');
				});
		});
	}

	/**
	 * Sends data to all connected peers.
	 * @param data - The data to send.
	 */
	public send(data: any): void {
		this.connections.forEach(connection => {
			connection.send(data);
		});
	}

	/**
	 * Closes the network connection.
	 */
	public disconnect(): void {
		this.peer?.destroy();
	}

	/**
	 * Removes a connection from the list of connections.
	 * @param connection
	 * @private
	 */
	private removeConnection(connection: DataConnection): void {
		connection.removeAllListeners();
		this.connections = this.connections.filter(c => c !== connection);
		void this.emit('removeConnection', connection);
	}

	/**
	 * Broadcasts data to all connected peers except the one specified.
	 * @param data - The data to send.
	 * @param exclude - The connection to exclude.
	 * @private
	 */
	private broadcast(data: any, exclude?: DataConnection): void {
		this.connections.forEach(connection => {
			if (connection !== exclude) {
				connection.send(data);
			}
		});
	}

	/**
	 * Adds a connection to the list of connections.
	 * @param connection - The connection to add.
	 * @private
	 */
	private addConnection(connection: DataConnection): void {
		console.log('New connection', connection.metadata);
		this.connections.push(connection);
		void this.emit('newConnection', connection);

		connection.once('close', () => {
			this.removeConnection(connection);
		});

		// Handle incoming data
		connection.on('data', data => {
			console.log('Received', data, 'from', connection.peer);

			// If we are the host, we need to broadcast the data to all other clients
			if (this.host) {
				this.broadcast(data, connection);
			}

			void this.emit('data', {
				connection,
				data,
			});
		});
	}

	private setStatus(status: NetworkStatus): void {
		this.status = status;
		void this.emit('status', status);
	}
}
