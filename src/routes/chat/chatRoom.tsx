import React, {useEffect} from 'react';
import {useLocation, useParams} from 'react-router-dom';
import Network from '@game/network/Network';

type LocationState = {
	host: boolean;
};

async function connectToRoom(roomId: string, host: boolean) {
	const network = Network.getInstance();
	if (host) {
		await network.createRoom(roomId);
	} else {
		await network.joinRoom(roomId);
	}

	return network;
}

type Message = {
	message: string;
	username: string;
};

export default function ChatRoom() {
	const {roomId} = useParams();
	const {state} = useLocation() as {state: LocationState};
	const [username, setUsername] = React.useState('');
	const [connected, setConnected] = React.useState(false);
	const [messages, setMessages] = React.useState<Message[]>([]);
	const [message, setMessage] = React.useState('');
	useEffect(() => {
		connectToRoom(roomId!, state?.host ?? false).then(network => {
			setConnected(true);
			network.on('newConnection', connection => {
				setMessages(messages => [...messages, {
					message: `${connection.peer} has joined the room`,
					username: 'System',
				}]);
			});
			network.on('removeConnection', connection => {
				setMessages(messages => [...messages, {
					message: `${connection.peer} has left the room`,
					username: 'System',
				}]);
			});
			network.on('data', ({data}) => {
				setMessages(messages => [...messages, data as Message]);
			});
		}).catch(console.error);
	}, []);

	function sendMessage(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const msg: Message = {
			message,
			username,
		};
		Network.getInstance().send(msg);
		setMessage('');
		setMessages(messages => [...messages, msg]);
	}

	return (
		<>
			<section className='h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white'>
				<div>
					{connected ? (
						<h1>Connected</h1>
					) : (
						<h1>Connecting...</h1>
					)}
					<input
						type='text'
						value={username}
						placeholder='Username'
						className='focus:ring-primary-600 focus:border-primary-600 mb-4 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm'
						onChange={e => {
							setUsername(e.target.value);
						}}/>
				</div>
				<div>
					{messages.map((message, index) => (
						<p key={index}>
							<span className='font-bold'>{message.username}: </span>
							{message.message}
						</p>
					))}
				</div>
				<form onSubmit={sendMessage} className='fixed left-0 bottom-0 my-4 flex w-full justify-center'>
					<input
						className='focus:ring-primary-600 focus:border-primary-600 mb-4 block w-1/2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 sm:text-sm'
						type='text'
						value={message}
						placeholder='Type a message...'
						onChange={e => {
							setMessage(e.target.value);
						}}/>
				</form>
			</section>
		</>
	);
}
