import Peer, {type DataConnection} from 'peerjs';
import {type Message, Network, NetworkStatus} from './Network';
import {type Metadata, type NetworkEvents, type PeerData} from '@game/network/NetworkEvents';

type Awaitable<T> = T | Promise<T>;

export class ClientNetwork extends Network<NetworkEvents, Metadata> {
	private peer?: Peer;
	private connection?: DataConnection;
	private peers: PeerData[] = [];
	private metadata?: Metadata;

	public get isHost() {
		return false;
	}

	public constructor() {
		super();
		this.channel('join', false).on(({peer: peerData, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('join', peerData.metadata.name);
		});
		this.channel('leave', false).on(({peer: peerData, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('leave', peerData.metadata.name);
		});
	}

	connect(options: {id: string; metadata: Metadata}): Awaitable<void> {
		this.metadata = options.metadata;
		return new Promise((resolve, reject) => {
			this.disconnect();
			void this.emit('status', NetworkStatus.Connecting);
			const peer = new Peer();
			peer
				.once('open', () => {
					const connection = peer.connect(options?.id, {
						metadata: options.metadata,
						serialization: 'json',
					});
					connection
						.once('open', () => {
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
		this.peers = [];
		void this.emit('peers', []);
		void this.emit('status', NetworkStatus.Disconnected);
	}

	send(channel: string, data: unknown): void {
		if (this.peer) {
			this.connection?.send({
				channel,
				data,
				peer: this.peer.id,
			});
		}
	}

	public connectedPeers(): PeerData[] {
		return this.peers;
	}

	public getMetadata() {
		return this.metadata;
	}

	public getPeerData(): PeerData | undefined {
		if (this.peer && this.metadata) {
			return {
				uuid: this.peer.id,
				metadata: this.metadata,
			};
		}
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
				this.handleMessage(connection, data as Message);
			});
	}

	protected removeConnection(connection: DataConnection): void {
		this.disconnect();
	}
}
