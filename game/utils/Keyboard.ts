import Emittery from 'emittery';

type KeyMap<Action extends string = never> = Record<Action, string[]>;
type Events = typeof Keyboard.events[number];

export class Keyboard<T extends KeyMap> extends Emittery {
	static readonly events = ['keydown', 'keyup'] as const;
	private readonly actions = new Map<string, readonly string[]>();
	private readonly keys = new Map<string, Events | false>();

	public start() {
		Keyboard.events.forEach(event => {
			document.addEventListener(event, e => {
				if (!e.repeat && this.keys.has(e.code)) {
					e.preventDefault();
					void this.emit(e.code, event);
					this.keys.set(e.code, event);
				}
			});
		});

		// Wheel event
		document.addEventListener('wheel', e => {
			void this.emit('wheel', e);
		});
	}

	addAction<A extends string>(action: A, keys: string[]): Keyboard<T & KeyMap<A>> {
		this.actions.set(action, keys);
		keys.forEach(key => this.keys.set(key, false));
		return this as Keyboard<T & KeyMap<A>>;
	}

	getAction(action: keyof T): boolean {
		return this.actions.get(action as string)?.some(key => this.keys?.get(key) === 'keydown') ?? false;
	}
}
