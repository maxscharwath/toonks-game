import Emittery, {type EmitteryOncePromise, type UnsubscribeFunction} from 'emittery';
import {type Network} from '@game/network/Network';
import {type Metadata, type NetworkEvents} from '@game/network/NetworkEvents';
import {type Vector3Tuple} from 'three';

export type GameEvents = {
	'tank:kill': {
		killer: string;
		killed: string;
	};
	'tank:hit': {
		from: string;
		to: string;
		damage: number;
	};
	'explosion:create': {
		position: Vector3Tuple;
		scale: number;
	};
	'tank:shoot': string;
	'tank:honk': string;
	'game:toast': {
		message: string;
		icon: string;
	};
};

export default class GameEvent {
	private readonly emitter = new Emittery<GameEvents>();
	private network?: Network<NetworkEvents, Metadata>;

	public setNetwork(network?: Network<NetworkEvents, Metadata>) {
		this.network = network;
		this.network?.channel('event').on(({event, data}) => {
			void this.emitter.emit(event as keyof GameEvents, data);
		});
	}

	public onAny(
		listener: (
			event: keyof GameEvents,
			data: GameEvents[keyof GameEvents]
		) => void | Promise<void>,
	): UnsubscribeFunction {
		return this.emitter.onAny(listener);
	}

	public on<Name extends keyof GameEvents>(
		event: Name | readonly Name[],
		listener: (data: GameEvents[Name]) => void | Promise<void>,
	): UnsubscribeFunction {
		return this.emitter.on(event, listener);
	}

	public once<Name extends keyof GameEvents>(event: Name | readonly Name[]): EmitteryOncePromise<GameEvents[Name]> {
		return this.emitter.once(event);
	}

	public off<Name extends keyof GameEvents>(
		event: Name | readonly Name[],
		listener: (data: GameEvents[Name]) => void | Promise<void>,
	) {
		this.emitter.off(event, listener);
	}

	public send<Name extends keyof GameEvents>(
		event: Name,
		data: GameEvents[Name],
		sendToHimself = true,
	) {
		this.network?.channel('event').send({event, data});
		if (sendToHimself) {
			void this.emitter.emit(event, data);
		}
	}
}
