import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { SocketContext } from './contexts/useSocket'
import { io } from "socket.io-client"
import { Router } from './Router'


const socket = io(`${window.location.hostname}:3001`, { autoConnect: false });



function App() {
  return (
    <SocketContext.Provider value={socket}>
      <ChakraProvider>
        <Router />
      </ChakraProvider>
    </SocketContext.Provider>
  )
}

export default App
