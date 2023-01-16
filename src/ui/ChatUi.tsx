import {useNetwork} from '@/store/store';
import React, {type RefObject, useEffect, useRef, useState} from 'react';
import {type PeerData} from '@game/network/NetworkEvents';
import {AnimatePresence, motion, useScroll, useTransform} from 'framer-motion';
import clsx from 'clsx';
import {root} from 'postcss';

type Message = {
	from: PeerData;
	message: string;
	date: Date;
};

function Item({message, container}: {message: Message; container: RefObject<HTMLElement>}) {
	return (
		<motion.div
			className='mb-1 flex space-x-2 rounded border border-gray-800/50 bg-gray-900/50 p-2 backdrop-blur-sm'
			initial={{opacity: 0, y: 20}}
			exit={{opacity: 0, y: -20}}
			whileInView={{opacity: 1, y: 0}}
			viewport={{root: container}}
		>
			<div className='text-toonks-orange font-bold'>
				{message.from.metadata.name}
			</div>
			<div className='overflow-hidden text-ellipsis text-gray-300'>{message.message}</div>
		</motion.div>
	);
}

export default function ChatUi(props: {className?: string}) {
	const scrollRef = useRef(null);
	const {network} = useNetwork();
	const [messages, setMessages] = useState<Message[]>([]);
	const inputRef = React.useRef<HTMLInputElement>(null);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const message = inputRef.current?.value;
		if (message) {
			send(message);
			inputRef.current.value = '';
		}
	}

	function addMessage(message: Message) {
		setMessages(messages => [...messages, message]
			.sort((a, b) => b.date.getTime() - a.date.getTime())
			.slice(-50),
		);
	}

	function send(message: string) {
		const peerData = network?.getPeerData();
		if (peerData) {
			const date = new Date();
			network?.channel('chat').send({
				message,
				date: date.toISOString(),
			});
			addMessage({
				from: peerData,
				message,
				date,
			});
		}
	}

	useEffect(() => {
		const unregister = network?.channel('chat').on((data, from) => {
			addMessage({
				from,
				message: data.message,
				date: new Date(data.date),
			});
		});
		return () => {
			unregister?.();
		};
	}, []);

	return (
		<div className={clsx(props.className, 'flex flex-col justify-end overflow-hidden')}>
			<div className='flex flex-1 flex-col-reverse overflow-y-auto' ref={scrollRef}>
				<AnimatePresence mode='sync'>
					{messages.map(message => (
						<Item message={message} container={scrollRef} key={`${message.from.uuid}-${message.date.getTime()}`}/>
					))}
				</AnimatePresence>
			</div>
			<form onSubmit={handleSubmit}>
				<input type='text' ref={inputRef} className='w-full rounded-md border bg-gray-200/50 p-2 text-black backdrop-blur-sm placeholder:text-gray-900' placeholder='Type a message'/>
			</form>
		</div>
	);
}
