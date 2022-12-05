import React, {Fragment, useEffect, useState} from 'react';

type Modify<T, R> = Omit<T, keyof R> & R;

type Props = Modify<React.HTMLAttributes<HTMLDivElement>, {
	length: number;
	value?: string;
	onChange?: (value: string) => void;
}>;
export default function CodeInput({length, value, onChange, ...props}: Props) {
	const [otp, setOtp] = useState<string[]>(Array.from({length}, (_, i) => value?.[i] ?? ''));
	const [focus, setFocus] = useState(0);

	function editOtp(index: number, value?: string) {
		const newOtp = [...otp];
		if (value) {
			value = value.toUpperCase().replace(/[^A-Z]/g, '');
			for (let i = index, j = 0; i < otp.length && j < value.length; i++, j++) {
				newOtp[i] = value[j];
				setFocus(Math.min(i + 1, otp.length - 1));
			}
		} else {
			newOtp[index] = '';
			setFocus(Math.max(index - 1, 0));
		}

		setOtp(newOtp);
		onChange?.(newOtp.join(''));
	}

	const inputRef = React.useRef<HTMLInputElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
		editOtp(index, e.target.value);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === 'Backspace' && !e.currentTarget.value) {
			editOtp(focus);
		}
	}

	useEffect(() => {
		inputRef.current?.focus();
	}, [focus]);

	return (
		<div className={`flex flex-row items-center justify-center space-x-2 ${props.className ?? ''}`}>
			{otp.map((_, index) => (
				<Fragment key={index}>
					<input
						type='text'
						ref={index === focus ? inputRef : null}
						className='h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-2xl focus:border-blue-400 focus:outline-none'
						onChange={e => {
							handleChange(e, index);
						}}
						onKeyDown={handleKeyDown}
						onFocusCapture={() => {
							setFocus(index);
						}}
						value={otp[index]}
						placeholder={index === focus ? '' : '⦿'}
					/>
				</Fragment>
			),
			)}
		</div>
	);
}
