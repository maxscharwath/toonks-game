import React from 'react';
import ReactDOM from 'react-dom/client';
import {Analytics} from '@vercel/analytics/react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import GameRenderer from '@/routes/GameRenderer';
import '@/global.css';
import Root from '@/routes/root/Root';
import HostGameTab from '@/routes/root/tab/HostGameTab';
import JoinGameTab from '@/routes/root/tab/JoinGameTab';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<Analytics/>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Root/>}>
					<Route path='/' element={<HostGameTab/>}/>
					<Route path='join/:code?' element={<JoinGameTab/>}/>
				</Route>
				<Route path='/game' element={<GameRenderer/>}/>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
