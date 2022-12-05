import React from 'react';
import {cva, type VariantProps} from 'class-variance-authority';

const button = cva('relative inline-flex items-center justify-center uppercase hover:scale-105 transition duration-100 ease-in-out', {
	variants: {
		variant: {
			default: 'text-white bg-toonks-orange hover:bg-toonks-orangeLight active:focus:ring-4 ring-toonks-orangeLight font-bold',
			primary: 'text-white bg-sky-500 hover:bg-sky-600 active:focus:ring-4 ring-sky-600 font-bold',
		},
		modifier: {
			outline: 'border border-toonks-orange text-toonks-orange bg-transparent hover:bg-toonks-orange hover:text-white',
			plain: 'text-toonks-orange bg-transparent hover:bg-toonks-orangeLight',
		},
		size: {
			small: 'text-sm px-4 py-1.5 rounded-sm',
			medium: 'text-base px-5 py-2.5 rounded-md',
			large: 'rounded-lg text-xl px-6 py-3 rounded-lg',
		},
		fullWidth: {
			true: 'w-full',
		},
		disabled: {
			true: 'opacity-50 cursor-not-allowed',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'medium',
	},
});
type Modify<T, R> = Omit<T, keyof R> & R;
type ButtonProps = Modify<React.HTMLAttributes<HTMLButtonElement>, VariantProps<typeof button>> & {
	loading?: boolean;
};

export default function Button({
	children,
	variant,
	modifier,
	size,
	fullWidth,
	disabled,
	loading,
	...props
}: ButtonProps) {
	return (
		<button className={button({variant, modifier, size, fullWidth, disabled})} {...props}
			disabled={Boolean(loading) || Boolean(disabled)}>
			{loading
        && <svg className='mr-3 h-5 w-5 animate-spin' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
        	<circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor'
        		strokeWidth='4'></circle>
        	<path className='opacity-75' fill='currentColor'
        		d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
        </svg>}
			{children}
		</button>
	);
}
