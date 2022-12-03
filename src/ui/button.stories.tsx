import React from 'react';
import Button from '@/ui/button';
import {type ComponentMeta, type ComponentStory} from '@storybook/react';

export default {
	title: 'Button',
	component: Button,
	args: {
		children: 'Default',
		loading: false,
		disabled: false,
		fullWidth: false,
	},
	argTypes: {
		size: {
			control: 'select',
			options: ['small', 'medium', 'large'],
		},
		modifier: {
			control: 'select',
			options: ['outline', 'plain', null],
		},
	},
} as ComponentMeta<typeof Button>;

export const Default: ComponentStory<typeof Button> = args => <Button variant='default' {...args} />;

