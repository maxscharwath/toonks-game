// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypes = {
	heig: {
		name: 'Heig',
		url: '/images/tank/heig.png',
	},
	military: {
		name: 'Military',
		url: '/images/tank/military.png',
	},
	studystorm: {
		name: 'StudyStorm',
		url: '/images/tank/studystorm.png',
	},
	weeb: {
		name: 'Weeb',
		url: '/images/tank/weeb.png',
	},
} as const satisfies Record<string, {
	name: string;
	url: string;
}>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypeList = Object
	.entries(TankTypes)
	.map(([key, value]) => ({key, value})) as Array<{key: TankType; value: typeof TankTypes[TankType]}>;

export type TankType = keyof typeof TankTypes;
