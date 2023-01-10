import Emittery, {type EmitteryOncePromise, type UnsubscribeFunction} from 'emittery';
import {type Network} from '@game/network/Network';
import {type Metadata, type NetworkEvents} from '@game/network/NetworkEvents';

export type GameEvents = {
	'tank:killed': {
		killer: string;
		killed: string;
	};
	'tank:shoot': string;
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
			console.log('receive', event, data);
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
	) {
		console.log('send', event, data);
		this.network?.channel('event').send({event, data});
		void this.emitter.emit(event, data); // Emit locally
	}
}
