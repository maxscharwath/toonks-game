import Peer, {type DataConnection} from 'peerjs';
import {Network, NetworkStatus} from './Network';
import {MessageType, type Message} from './Message';

type Awaitable<T> = T | Promise<T>;
type HandleConnection = (connection: DataConnection) => Awaitable<boolean>;

export class ServerNetwork extends Network {
	private peer?: Peer;
	private readonly connections = new Set<DataConnection>();
	private handleConnection?: HandleConnection;

	public get isHost() {
		return true;
	}

	public constructor(private readonly id: string) {
		super();
	}

	public async connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.disconnect();
			void this.emit('status', NetworkStatus.Connecting);
			const peer = new Peer(this.id);
			peer
				.once('open', id => {
					void this.emit('connected', id);
					void this.emit('status', NetworkStatus.Connected);
					console.log('My peer ID is: ' + id);
					peer.on('connection', async conn => {
						console.log('Connection received');
						if (await this.handleConnection?.(conn) ?? true) {
							console.log('Connection accepted');
							this.addConnection(conn);
						} else {
							console.log('Connection rejected');
							conn.close();
						}
					});
					this.peer = peer;
					resolve();
				})
				.once('disconnected', () => {
					this.disconnect();
				})
				.once('error', error => {
					this.disconnect();
					reject(error);
				});
		});
	}

	public disconnect(): void {
		this.peer?.destroy();
		this.peer?.removeAllListeners();
		this.connections.clear();
		this.peer = undefined;
		void this.emit('status', NetworkStatus.Disconnected);
	}

	public getConnections(): DataConnection[] {
		return [...this.connections];
	}

	public send(data: any): void {
		this.connections.forEach(connection => {
			connection.send(data);
		});
	}

	public sendTo(connection: DataConnection, data: any): void {
		connection.send(data);
	}

	public setHandleConnection(handleConnection: HandleConnection): void {
		this.handleConnection = handleConnection;
	}

	public connectedPeersNumber(): number {
		return this.connections.size;
	}

	protected addConnection(connection: DataConnection): void {
		this.connections.add(
			connection
				.on('open', () => {
					console.log('new conn, sending message to clients');
					// Send message to all connected clients, to notify a new client is there
					const message: Message = {
						type: MessageType.JOIN,
						data: this.connections.size,
					};
					this.send(message);
				})
				.on('data', data => {
					void this.emit('data', {connection, data});
				})
				.on('close', () => {
					this.removeConnection(connection);
				})
				.on('error', error => {
					console.error(error);
					this.removeConnection(connection);
				}),
		);
	}

	protected removeConnection(connection: DataConnection): void {
		connection.close();
		connection.removeAllListeners();
		this.connections.delete(connection);
	}
}
