export enum MessageType {
	JOIN,
	CREATE,
}

export type Message = {
	type: MessageType;
	data: any;
};
