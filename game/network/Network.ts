import Peer, {type DataConnection} from 'peerjs';
import Emittery from 'emittery';

export enum NetworkStatus {
	Disconnected = 'disconnected',
	Connecting = 'connecting',
	Connected = 'connected',
}

type Awaitable<T> = T | Promise<T>;
type HandleConnection = (connection: DataConnection) => Awaitable<boolean>;

export abstract class Network<T = Record<string, unknown>> extends Emittery<T & {
	connected: string;
	disconnected: never;
	status: NetworkStatus;
	data: {connection: DataConnection; data: any};
}> {
	private static get uniquePrefix() {
		return 'SWNpT25Fc3REZXNDcmFja3M';
	}

	public static createRoomId(options: Partial<{length: number; prefix: string; value: string}>): {full: string; code: string} {
		const {length = 6, prefix = '', value} = options;
		const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		const code = value ?? Array.from({length}, () => alphabet.at(Math.floor(Math.random() * alphabet.length))).join('');
		return {
			full: [Network.uniquePrefix, prefix, code].filter(Boolean).join('-'),
			code,
		};
	}

	public static parseRoomId(roomId: string, {prefix}: Partial<{prefix: string}> = {}): string | undefined {
		const parts = roomId.split('-');
		if (parts[0] !== Network.uniquePrefix || (prefix && parts[1] !== prefix)) {
			return;
		}

		return parts.at(-1);
	}

	abstract connect(id?: string): Awaitable<void>;

	abstract disconnect(): void;

	abstract send(data: any): void;

	protected abstract addConnection(connection: DataConnection): void;

	protected abstract removeConnection(connection: DataConnection): void;
}

export class ServerNetwork extends Network {
	private peer?: Peer;
	private readonly connections = new Set<DataConnection>();
	private handleConnection?: HandleConnection;

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

	protected addConnection(connection: DataConnection): void {
		this.connections.add(
			connection
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

export class ClientNetwork extends Network {
	private peer?: Peer;
	private connection?: DataConnection;

	public constructor(private readonly metadata: unknown) {
		super();
	}

	connect(id: string): Awaitable<void> {
		return new Promise((resolve, reject) => {
			this.disconnect();
			void this.emit('status', NetworkStatus.Connecting);
			const peer = new Peer();
			peer
				.once('open', peerId => {
					const connection = peer.connect(id, {
						metadata: this.metadata,
					});
					connection
						.once('open', () => {
							void this.emit('connected', peerId);
							void this.emit('status', NetworkStatus.Connected);
							this.peer = peer;
							this.addConnection(connection);
							resolve();
						})
						.once('error', error => {
							this.disconnect();
							reject(error);
						});
				})
				.once('error', error => {
					this.disconnect();
					reject(error);
				});
		});
	}

	disconnect(): void {
		this.peer?.destroy();
		this.peer?.removeAllListeners();
		this.peer = undefined;
		this.connection = undefined;
		void this.emit('status', NetworkStatus.Disconnected);
	}

	send(data: any): void {
		this.connection?.send(data);
	}

	protected addConnection(connection: DataConnection): void {
		this.connection = connection
			.on('close', () => {
				this.removeConnection(connection);
			})
			.on('error', () => {
				this.removeConnection(connection);
			})
			.on('data', data => {
				void this.emit('data', {connection, data});
			});
	}

	protected removeConnection(connection: DataConnection): void {
		connection.close();
		connection.removeAllListeners();
		this.connection = undefined;
	}
}
