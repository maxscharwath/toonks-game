import Peer, {type DataConnection} from 'peerjs';
import Emittery from 'emittery';

type NetworkEvents = {
	connected: string;
	disconnected: never;
	newConnection: DataConnection;
	removeConnection: DataConnection;
	data: {connection: DataConnection; data: any};
};

enum NetworkState {
	Disconnected,
	Connecting,
	Connected,
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

	private static instance: Network;
	private readonly connections: DataConnection[] = [];
	private peer?: Peer;
	private host = false;
	private status = NetworkState.Disconnected;

	private constructor() {
		super();
	}

	/**
	 * Joins an existing room.
	 * @param roomId - The room id to join.
	 */
	public async joinRoom(roomId: string): Promise<void> {
		this.host = false;
		return new Promise((resolve, reject) => {
			this.status = NetworkState.Connecting;

			this.peer = new Peer();

			this.peer.once('open', id => {
				const connection: DataConnection = this.peer!.connect(roomId, {reliable: true});
				connection.once('open', async () => {
					this.status = NetworkState.Connected;
					await this.emit('connected', id);
					await this.addConnection(connection);
					resolve();
				});
				connection.once('error', reject);
			});

			this.peer.once('disconnected', async () => {
				this.status = NetworkState.Disconnected;
				await this.emit('disconnected');
			});
		});
	}

	/**
	 * Creates a new room and returns the room id.
	 * @param roomId - The room id to create.
	 */
	public async createRoom(roomId: string): Promise<string> {
		this.host = true;
		return new Promise(resolve => {
			this.status = NetworkState.Connecting;

			this.peer = new Peer(roomId);

			this.peer.on('connection', async connection => {
				await this.addConnection(connection);
			});

			this.peer.once('open', async id => {
				this.status = NetworkState.Connected;
				await this.emit('connected', id);
				resolve(id);
			});

			this.peer.once('disconnected', async () => {
				this.status = NetworkState.Disconnected;
				await this.emit('disconnected');
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
	private async removeConnection(connection: DataConnection): Promise<void> {
		connection.removeAllListeners();
		this.connections.splice(this.connections.indexOf(connection), 1);
		await this.emit('removeConnection', connection);
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
	private async addConnection(connection: DataConnection): Promise<void> {
		this.connections.push(connection);
		await this.emit('newConnection', connection);

		connection.once('close', async () => {
			await this.removeConnection(connection);
		});

		// Handle incoming data
		connection.on('data', async data => {
			console.log('Received', data, 'from', connection.peer);

			// If we are the host, we need to broadcast the data to all other clients
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
