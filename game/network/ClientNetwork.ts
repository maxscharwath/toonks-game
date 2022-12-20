import Peer, {type DataConnection} from 'peerjs';
import {Network, NetworkStatus} from './Network';
import {MessageType, type Message} from './Message';

type Awaitable<T> = T | Promise<T>;

export class ClientNetwork extends Network {
	private peer?: Peer;
	private connection?: DataConnection;
	private peerConnectionsNumber: number;

	public get isHost() {
		return false;
	}

	public constructor(private readonly metadata: unknown) {
		super();
		this.peerConnectionsNumber = 0;
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

	public connectedPeersNumber(): number {
		return this.peerConnectionsNumber;
	}

	protected addConnection(connection: DataConnection): void {
		this.connection = connection
			.on('open', () => {
				this.peerConnectionsNumber += 1;
			})
			.on('close', () => {
				this.removeConnection(connection);
			})
			.on('error', () => {
				this.removeConnection(connection);
			})
			.on('data', data => {
				const message = data as Message;
				console.log('data got', message);
				if (message.type === MessageType.JOIN) {
					this.peerConnectionsNumber = message.data as number; // Tmp for testing, should be an array of player to display their infos
				}

				void this.emit('data', {connection, data});
			});
	}

	protected removeConnection(connection: DataConnection): void {
		connection.close();
		connection.removeAllListeners();
		this.connection = undefined;
	}
}
