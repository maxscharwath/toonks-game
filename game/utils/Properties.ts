import Emittery from 'emittery';

type PropertyOptions<T, U=any> = {
	default: T;
	get?: (value: T) => T;
	set?: (value: T) => T;
	onChange?: (value: T, oldValue: T) => void;
	export?: (value: T) => U;
	import?: (value: U) => T;
};

class Property<T> extends Emittery<{change: [T, T]}> {
	private _value!: T;
	constructor(private readonly options: PropertyOptions<T>) {
		super();
		if (options.onChange) {
			this.onChange(options.onChange);
		}

		this.value = options.default;
	}

	public get value(): T {
		return this.options.get?.(this._value) ?? this._value;
	}

	public set value(value: T) {
		const o = this._value;
		const v = this.options.set?.(value) ?? value;
		if (v !== o) {
			this._value = v;
			void this.emit('change', [v, o]);
		}
	}

	public onChange(listener: (value: T, oldValue: T) => void, fire?: boolean): () => void {
		if (fire) {
			listener(this.value, this.value);
		}

		return this.on('change', ([value, oldValue]) => {
			listener(value, oldValue);
		});
	}

	public set(setter: (value: T) => T): void {
		this.value = setter(this.value);
	}

	public export(): unknown {
		return this.options.export?.(this.value) ?? this.value;
	}

	public import(value: unknown): void {
		this.value = this.options.import?.(value) ?? (value as T);
	}
}

export class Properties<State extends Record<string, unknown>> extends Emittery<{change: never}> {
	private readonly properties = new Map<string, Property<any>>();

	public addProperty<K extends keyof State>(key: K, options: PropertyOptions<State[K]>): this {
		const property = new Property(options);
		this.properties.set(key as string, property);
		void property.on('change', () => {
			void this.emit('change');
		});
		return this;
	}

	public getProperty<K extends keyof State>(key: K): Property<State[K]> {
		return this.properties.get(key as string) as Property<State[K]>;
	}

	public export(): State {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const state: State = {} as State;
		this.properties.forEach((property, key) => {
			Object.assign(state, {[key]: property.export()});
		});
		return state;
	}

	public import(state: Partial<State>): void {
		this.properties.forEach((property, key) => {
			if (state[key] !== undefined) {
				property.import(state[key]);
			}
		});
	}
}
