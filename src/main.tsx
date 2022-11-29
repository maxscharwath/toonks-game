import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import Root from '@/routes/root';
import Game from '@/routes/game';
import '@/global.css';
import ChatRoom from '@/routes/chat/chatRoom';
import ChatLoby from '@/routes/chat/chatLoby';

const router = createBrowserRouter([
	{
		path: '/',
		element: <Root />,
	},
	{
		path: '/game/:gameId',
		element: <Game />,
	},
	{
		path: '/chat/',
		element: <ChatLoby />,
	},
	{
		path: '/chat/:roomId',
		element: <ChatRoom />,
	},
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<RouterProvider router={router} />
	</React.StrictMode>,
);
