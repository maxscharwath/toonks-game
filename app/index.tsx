'use client'
import { SetStateAction, useState } from 'react'
import './index.css'

export default function Index () {
   const [gameId, setGameId] = useState('')

   const handleInputChange = (e: { target: { value: SetStateAction<string> } }) => {
      setGameId(e.target.value)
   }

   const createGame = () => {
      console.log('creating')
   }

   const connectToGame = () => {
      if (!gameId) return

      console.log('joining')

   }

   return (
      <>
         <div className='menu'>
            <p className='menu-title'>LOGO</p>

            <div className='menu-actions'>
               <div>
                  <input type='text' placeholder='Enter game ID' value={gameId} onChange={handleInputChange} />
                  <button className='menu-buttons' onClick={connectToGame}>
                     Join
                  </button>
               </div>

               <div>
                  <button className='menu-buttons' onClick={createGame}>
                     Create
                  </button>
               </div>
            </div>
         </div>
      </>
   )
}
