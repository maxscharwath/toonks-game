// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypes = {
	heig: {
		name: 'Heig',
		url: '/images/tank/heig.png',
		backdrop: '/images/avatar/heig.png',
		avatar: '/images/avatar/heig.cropped.png',
	},
	military: {
		name: 'Military',
		url: '/images/tank/military.png',
		backdrop: '/images/avatar/military.png',
		avatar: '/images/avatar/military.cropped.png',
	},
	studystorm: {
		name: 'StudyStorm',
		url: '/images/tank/studystorm.png',
		backdrop: '/images/avatar/studystorm.png',
		avatar: '/images/avatar/studystorm.cropped.png',
	},
	weeb: {
		name: 'Weeb',
		url: '/images/tank/weeb.png',
		backdrop: '/images/avatar/weeb.png',
		avatar: '/images/avatar/weeb.cropped.png',
	},
} as const satisfies Record<string, {
	name: string;
	url: string;
	backdrop: string;
	avatar: string;
}>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypeList = Object
	.entries(TankTypes)
	.map(([key, value]) => ({key, value})) as Array<{key: TankType; value: typeof TankTypes[TankType]}>;

export type TankType = keyof typeof TankTypes;
