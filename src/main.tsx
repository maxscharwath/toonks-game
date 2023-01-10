import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import GameRenderer from '@/routes/GameRenderer';
import '@/global.css';
import Root from '@/routes/root/Root';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Root/>}/>
				<Route path='/game' element={<GameRenderer/>}/>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
