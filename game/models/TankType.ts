// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypes = {
	heig: {
		name: 'HEIG Van Damme',
		url: '/images/tank/heig.webp',
		backdrop: '/images/avatar/heig.webp',
		avatar: '/images/avatar/heig.cropped.webp',
		honk: '/sounds/bonk.ogg',
	},
	military: {
		name: 'Soldier Boy',
		url: '/images/tank/military.webp',
		backdrop: '/images/avatar/military.webp',
		avatar: '/images/avatar/military.cropped.webp',
		honk: '/sounds/horn.ogg',
	},
	studystorm: {
		name: 'StudyStorm',
		url: '/images/tank/studystorm.webp',
		backdrop: '/images/avatar/studystorm.webp',
		avatar: '/images/avatar/studystorm.cropped.webp',
		honk: '/sounds/chad.ogg',
	},
	weeb: {
		name: 'Weeb Kawaii',
		url: '/images/tank/weeb.webp',
		backdrop: '/images/avatar/weeb.webp',
		avatar: '/images/avatar/weeb.cropped.webp',
		honk: '/sounds/uwu.ogg',
	},
	thomas: {
		name: 'Thomas The Tank',
		url: '/images/tank/thomas.webp',
		backdrop: '/images/avatar/thomas.webp',
		avatar: '/images/avatar/thomas.cropped.webp',
		honk: '/sounds/thomas.ogg',
	},
} as const satisfies Record<string, {
	name: string;
	url: string;
	backdrop: string;
	avatar: string;
	honk: string;
}>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const TankTypeList = Object
	.entries(TankTypes)
	.map(([key, value]) => ({key, value})) as Array<{key: TankType; value: typeof TankTypes[TankType]}>;

export type TankType = keyof typeof TankTypes;
