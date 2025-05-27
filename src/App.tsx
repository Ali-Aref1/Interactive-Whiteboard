import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { Container } from './components/Container'
import { SocketContext } from './contexts/useSocket'
import { io } from "socket.io-client"

const socket = io(`${window.location.hostname}:3001`);

function App() {
  return (
    <SocketContext.Provider value={socket}>
      <ChakraProvider>
        <Container/>
      </ChakraProvider>
    </SocketContext.Provider>
  )
}

export default App
