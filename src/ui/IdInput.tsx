import React, {useState, Fragment, useEffect} from 'react';

type Props = {
	value?: string;
	onChange?: (value: string) => void;
	className?: string;
};
export default function IdInput(props: Props) {
	const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
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
		props.onChange?.(newOtp.join(''));
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
		editOtp(0, props.value);
	}, []);

	useEffect(() => {
		inputRef.current?.focus();
	}, [focus]);

	return (
		<div className={`flex flex-row justify-center items-center space-x-2 ${props.className ?? ''}`}>
			{otp.map((_, index) => (
				<Fragment key={index}>
					<input
						type='text'
						ref={index === focus ? inputRef : null}
						className='w-12 h-12 border-2 border-gray-300 rounded-lg text-center text-2xl focus:outline-none focus:border-blue-400'
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
