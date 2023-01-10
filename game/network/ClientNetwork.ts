import Peer, {type DataConnection} from 'peerjs';
import {type Message, Network, NetworkStatus} from './Network';
import {type NetworkEvents, type PeerData} from '@game/network/NetworkEvents';

type Awaitable<T> = T | Promise<T>;

export class ClientNetwork extends Network<NetworkEvents> {
	private peer?: Peer;
	private connection?: DataConnection;
	private peers: PeerData[] = [];

	public get isHost() {
		return false;
	}

	public constructor() {
		super();
		this.channel('join').on(({peer: peerData, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('join', peerData.uuid);
		});
		this.channel('leave').on(({peer: peerData, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('leave', peerData.uuid);
		});
	}

	connect(options: {id: string; metadata?: unknown}): Awaitable<void> {
		return new Promise((resolve, reject) => {
			this.disconnect();
			void this.emit('status', NetworkStatus.Connecting);
			const peer = new Peer();
			peer
				.once('open', () => {
					const connection = peer.connect(options?.id, {
						metadata: options.metadata,
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
		this.connection?.send({channel, data});
	}

	public connectedPeers(): PeerData[] {
		return this.peers;
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
				const message = data as Message;
				this.handleMessage(connection, message);
				void this.emit('data', {connection, data});
			});
	}

	protected removeConnection(connection: DataConnection): void {
		this.disconnect();
	}
}
