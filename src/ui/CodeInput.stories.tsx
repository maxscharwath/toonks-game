import React from 'react';
import {type ComponentMeta, type ComponentStory} from '@storybook/react';
import CodeInput from '@/ui/CodeInput';

export default {
	title: 'Code Input',
	component: CodeInput,
	args: {
		length: 6,
	},
	argTypes: {
		onChange: {action: 'changed'},
	},
} as ComponentMeta<typeof CodeInput>;

export const Default: ComponentStory<typeof CodeInput> = args => <CodeInput {...args} />;

