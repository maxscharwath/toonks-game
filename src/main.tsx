import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes} from 'react-router-dom';
import Root from '@/routes/root';
import Game from '@/routes/game';
import '@/global.css';
import ChatRoom from '@/routes/chat/chatRoom';
import ChatLobby from '@/routes/chat/chatLobby';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<BrowserRouter>
		<Routes>
			<Route path='/' element={<Root />} />
			<Route path='/game/:gameId' element={<Game />} />
			<Route path='/chat/' element={<ChatLobby />} />
			<Route path='/chat/:roomId' element={<ChatRoom />} />
		</Routes>
	</BrowserRouter>,
);
