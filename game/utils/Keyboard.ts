import Emittery from 'emittery';

type KeyMap<Action extends string = never> = Record<Action, string[]>;
type Events = typeof Keyboard.events[number];

export class Keyboard<T extends KeyMap> extends Emittery {
	static readonly events = ['keydown', 'keyup'] as const;
	private readonly actionKeys = new Map<string, readonly string[]>();
	private readonly keys = new Map<string, {
		actions: string[];
		event: Events | false;
	}>();

	constructor(private enabled = true) {
		super();
	}

	public setEnabled(enabled: boolean) {
		this.enabled = enabled;
		if (!enabled) {
			this.keys.forEach(key => {
				key.event = false;
			});
		}
	}

	public start() {
		Keyboard.events.forEach(event => {
			document.addEventListener(event, e => {
				if (!this.enabled) {
					return;
				}

				if (!e.repeat && this.keys.has(e.code)) {
					e.preventDefault();
					const key = this.keys.get(e.code);
					if (key) {
						key.event = event;
						if (event === 'keydown') {
							key.actions.forEach(async action => this.emit(action));
						}
					}
				}
			});
		});

		// Wheel event
		document.addEventListener('wheel', e => {
			if (this.enabled) {
				e.preventDefault();
				void this.emit('wheel', e);
			}
		}, {passive: false});
	}

	addAction<A extends string>(action: A, keys: string[]): Keyboard<T & KeyMap<A>> {
		this.actionKeys.set(action, keys);
		keys.forEach(key => {
			if (!this.keys.has(key)) {
				this.keys.set(key, {
					actions: [],
					event: false,
				});
			}

			this.keys.get(key)?.actions.push(action);
		});
		return this as Keyboard<T & KeyMap<A>>;
	}

	getAction(action: keyof T): boolean {
		return this.actionKeys.get(action as string)?.some(key => this.keys?.get(key)?.event === 'keydown') ?? false;
	}

	getOnAction(action: keyof T, listener: () => void, delta = 0): () => void {
		let last = 0;
		return this.on(action as string, () => {
			if (last + delta < Date.now()) {
				last = Date.now();
				listener();
			}
		});
	}
}
