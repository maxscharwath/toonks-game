<div align="center">
    <img src="https://user-images.githubusercontent.com/6887819/204644662-6b9bba81-5f09-4433-9c88-4541ff90d798.svg" alt="logo" height="300" />
</div>

# TOONKS 🕹️
> By Nicolas Crausaz, Lazar Pavicevic & Maxime Scharwath

TOONKS is a 3D Multiplayer Game where you can play a tiny tank against your friends.
You can play on your browser without any installation.

## How to play
> Go to https://toonks.com/

## Before playing
For the moment, please play only with Chromium-based browsers (Chrome, Edge, Opera, Brave, Vivaldi, etc.). This game is not compatible with Firefox and Safari.
For the best experience, please use a powerful computer with a good internet connection.
This game use WebRTC to connect players. Your IP can be leaked if you play with a VPN.
We are not responsible for any damage caused by this game. Please play responsibly.


## Technical details
- [x] 3D Game
- [x] Multiplayer
- [x] WebRTC
- [x] React
- [x] Three.js
- [x] TypeScript
- [x] Vite
- [x] TailwindCSS

### Network protocol
The network protocol is based on WebRTC and uses the [PeerJS](https://peerjs.com/) library.
There is a host and multiple clients. The host is the one who creates the game and the clients are the ones who join the game.

## How to run the project
> You need to have Node.js installed on your computer

```bash
# yarn install
# yarn dev
```
