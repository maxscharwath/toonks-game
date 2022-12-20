import {type DataConnection} from 'peerjs';
import Emittery from 'emittery';

export enum NetworkStatus {
	Disconnected = 'disconnected',
	Connecting = 'connecting',
	Connected = 'connected',
}

type Awaitable<T> = T | Promise<T>;

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

	abstract isHost: boolean;

	abstract connect(id?: string): Awaitable<void>;

	abstract disconnect(): void;

	// TODO: change any with the Message type
	abstract send(data: any): void;

	abstract connectedPeersNumber(): number;

	protected abstract addConnection(connection: DataConnection): void;

	protected abstract removeConnection(connection: DataConnection): void;
}
