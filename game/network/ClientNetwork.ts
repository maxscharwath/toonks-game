import Peer, {type DataConnection} from 'peerjs';
import {type Message, Network, NetworkStatus} from './Network';
import {type NetworkEvents} from '@game/network/NetworkEvents';

type Awaitable<T> = T | Promise<T>;

export class ClientNetwork extends Network<NetworkEvents> {
	private peer?: Peer;
	private connection?: DataConnection;
	private peers: string[] = [];

	public get isHost() {
		return false;
	}

	public constructor(private readonly metadata: unknown) {
		super();
		this.channel('join').on(({uuid, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('join', uuid);
		});
		this.channel('leave').on(({uuid, peers}) => {
			this.peers = peers;
			void this.emit('peers', peers);
			void this.emit('leave', uuid);
		});
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
		this.peers = [];
		void this.emit('peers', []);
		void this.emit('status', NetworkStatus.Disconnected);
	}

	send(channel: string, data: unknown): void {
		this.connection?.send({channel, data});
	}

	public connectedPeers(): string[] {
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
