import Peer, {type DataConnection} from 'peerjs';
import {type Message, Network, NetworkStatus} from './Network';
import {type PeerData, type NetworkEvents, type Metadata} from '@game/network/NetworkEvents';

type Awaitable<T> = T | Promise<T>;
type HandleConnection = (connection: DataConnection) => Awaitable<boolean>;

export class ServerNetwork extends Network<NetworkEvents, Metadata> {
	private peer?: Peer;
	private readonly connections = new Set<DataConnection>();
	private handleConnection?: HandleConnection;
	private metadata?: Metadata;

	public get isHost() {
		return true;
	}

	public constructor(private readonly id: string) {
		super();
	}

	public async connect(options: {metadata: Metadata}): Promise<void> {
		this.metadata = options.metadata;
		return new Promise((resolve, reject) => {
			this.disconnect();
			void this.emit('status', NetworkStatus.Connecting);
			const peer = new Peer(this.id);
			peer
				.once('open', id => {
					void this.emit('status', NetworkStatus.Connected);
					console.log('My peer ID is: ' + id);
					peer.on('connection', async conn => {
						if (await this.handleConnection?.(conn) ?? true) {
							this.addConnection(conn);
						} else {
							conn.close();
						}
					});
					this.peer = peer;
					void this.emit('peers', this.connectedPeers());
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

	public send(channel: string, data: unknown): void {
		this.connections.forEach(connection => {
			connection.send({channel, data});
		});
	}

	public sendTo(connection: DataConnection, data: any): void {
		connection.send(data);
	}

	public setHandleConnection(handleConnection: HandleConnection): void {
		this.handleConnection = handleConnection;
	}

	public connectedPeers(): PeerData[] {
		const peers = Array.from(this.connections).map(connection => ({uuid: connection.peer, metadata: connection.metadata as Metadata}));
		if (this.metadata && this.peer) {
			peers.push({uuid: this.peer.id, metadata: this.metadata});
		}

		return peers;
	}

	public getMetadata() {
		return this.metadata;
	}

	protected addConnection(connection: DataConnection): void {
		connection.once('open', () => {
			this.connections.add(
				connection
					.on('data', data => {
						void this.emit('data', {connection, data});
						this.handleMessage(connection, data as Message);
					})
					.on('close', () => {
						this.removeConnection(connection);
					})
					.on('error', error => {
						console.error(error);
						this.removeConnection(connection);
					}),
			);
			const peers = this.connectedPeers();
			void this.emit('peers', peers);
			void this.emit('join', connection.peer);
			this.channel('join').send({
				peer: {uuid: connection.peer, metadata: connection.metadata as Metadata},
				peers,
			});
		});
	}

	protected removeConnection(connection: DataConnection): void {
		connection.close();
		connection.removeAllListeners();
		this.connections.delete(connection);

		const peers = this.connectedPeers();
		void this.emit('peers', peers);
		void this.emit('leave', connection.peer);
		this.channel('leave').send({
			peer: {uuid: connection.peer, metadata: connection.metadata as Metadata},
			peers,
		});
	}
}
