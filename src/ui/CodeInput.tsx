import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';

type Modify<T, R> = Omit<T, keyof R> & R;

type CodeInputProps = Modify<React.HTMLProps<HTMLInputElement>, {
	length: number;
	value?: string;
	transform?: (value: string) => string;
	onChange?: (value: string) => void;
}>;

type SingleCodeInputProps = Modify<React.HTMLProps<HTMLInputElement>, {
	focus?: boolean;
	autoFocus?: boolean;
}>;

function SingleCodeInput({focus, autoFocus, ...props}: SingleCodeInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const {current: input} = inputRef;
		if (input && autoFocus && focus) {
			input.focus();
		}
	}, []);

	useEffect(() => {
		const {current: input} = inputRef;
		if (focus && input) {
			input.focus();
			input.select();
		}
	}, [focus]);

	return <input ref={inputRef} {...props} autoComplete='off' maxLength={1} placeholder={focus ? '' : props.placeholder} />;
}

export default function CodeInput(props: CodeInputProps) {
	const {length, value, transform, onChange} = {
		value: '',
		transform: (value: string) => value.toUpperCase().replace(/[^A-Z]/g, ''),
		...props,
	};

	const [activeIndex, setActiveIndex] = useState(0);

	const [code, setCode] = useState<string[]>([]);

	function focusIndex(index: number) {
		setActiveIndex(Math.max(0, Math.min(index, length - 1)));
	}

	function editCode(from: number, value: string): number {
		if (value && code.join('') === value) {
			return from;
		}

		const transformed = transform(value);
		const newCode = Array.from({length}, (_, i) => (
			((i === from) && !value) ? '' : transformed[i - from] ?? code[i] ?? ''
		));
		setCode(newCode);
		onChange?.(newCode.join(''));
		return from + transformed.length;
	}

	useEffect(() => {
		editCode(0, value);
	}, [value, length]);

	const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {value} = e.target;
		focusIndex(editCode(activeIndex, value));
	};

	const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		editCode(activeIndex, e.clipboardData.getData('text/plain'));
	};

	const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace') {
			e.preventDefault();
			editCode(activeIndex, '');
			focusIndex(activeIndex - 1);
		} else if (e.key === 'Delete') {
			e.preventDefault();
			editCode(activeIndex, '');
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			focusIndex(activeIndex - 1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			focusIndex(activeIndex + 1);
		} else if (e.key === ' ') {
			e.preventDefault();
		}
	};

	return (
		<div className={clsx('flex flex-row items-center justify-center space-x-2', props.className)}>
			{code.map((_, index) => (
				<SingleCodeInput
					key={index}
					type='text'
					className='h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-2xl focus:border-blue-400 focus:outline-none'
					placeholder={props.placeholder ?? '⦿'}
					value={code[index]}
					focus={activeIndex === index}
					onChange={handleOnChange}
					onPaste={handleOnPaste}
					onKeyDown={handleOnKeyDown}
					onFocus={e => {
						e.target.select();
						setActiveIndex(index);
					}}
					onBlur={() => {
						setActiveIndex(-1);
					}}
				/>
			),
			)}
		</div>
	);
}
