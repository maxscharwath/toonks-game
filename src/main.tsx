import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Root from '@/routes/root/root';
import Game from '@/routes/game';
import '@/global.css';
import ChatRoom from '@/routes/chat/chatRoom';
import ChatLobby from '@/routes/chat/chatLobby';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Root/>}/>
				<Route path='/game' element={<Game/>}/>
				<Route path='/chat/' element={<ChatLobby/>}/>
				<Route path='/chat/:roomId' element={<ChatRoom/>}/>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
