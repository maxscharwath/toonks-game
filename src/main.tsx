import React from 'react';
import ReactDOM from 'react-dom/client';
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Game from '@/routes/game';
import '@/global.css';
import Root from '@/routes/root/root';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Root/>}/>
				<Route path='/game' element={<Game/>}/>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>,
);
