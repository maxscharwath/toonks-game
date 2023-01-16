import {type DataConnection} from 'peerjs';
import Emittery from 'emittery';
import {type PeerData} from './NetworkEvents';

export enum NetworkStatus {
	Disconnected = 'disconnected',
	Connecting = 'connecting',
	Connected = 'connected',
}

export type Message = {
	peer: string;
	channel: string;
	data: unknown;
};

type Awaitable<T> = T | Promise<T>;

export abstract class Network<T = Record<string, any>, Metadata = never> extends Emittery<{
	connected: string;
	disconnected: never;
	status: NetworkStatus;
	peers: PeerData[];
	join: string;
	leave: string;
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

	abstract isHost: boolean;

	protected channelEmitter = new Emittery<{
		[K in keyof T]: {
			peer: string;
			data: T[K];
		};
	}>();

	public channel<U extends keyof T>(channel: U, checkPeer = true) {
		return {
			on: (listener: (data: T[U], peer: PeerData) => void) => this.channelEmitter.on(channel, msg => {
				const peerData = this.connectedPeers().find(peer => peer.uuid === msg.peer);
				if (!checkPeer || peerData) {
					listener(msg.data as T[U], peerData!);
				}
			}),
			send: (data: T[U]) => {
				this.send(channel as string, data);
			},
		};
	}

	abstract connect(options: Partial<{id: string; metadata: unknown}>): Awaitable<void>;

	abstract disconnect(): void;

	abstract send(channel: string, data: unknown): void;

	abstract connectedPeers(): PeerData[];

	abstract getMetadata(): Metadata | undefined;

	abstract getPeerData(): PeerData | undefined;

	protected handleMessage(connection: DataConnection, data: Message) {
		const {channel, ...message} = data;
		void this.channelEmitter.emit(channel as keyof T, message as any);
	}

	protected abstract addConnection(connection: DataConnection): void;

	protected abstract removeConnection(connection: DataConnection): void;
}
