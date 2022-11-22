'use client'
import { useState } from 'react'
import { Peer } from 'peerjs'
import './index.css'

export default function Index() {
   const [gameId, setGameId] = useState('')

   let peer = new Peer()

   const handleInputChange = (e) => {
      setGameId(e.target.value)
   }

   const createGame = () => {
      console.log('creating')
   }

   const connectToGame = () => {
      if (!gameId) return

      console.log('joining')

      const conn = peer.connect(gameId)

      conn.on('open', () => {
         conn.send('hi!')
      })
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
