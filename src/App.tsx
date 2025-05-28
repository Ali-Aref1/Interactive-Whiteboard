import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { SocketContext } from './contexts/useSocket'
import { UserContext} from './contexts/useAuth'
import { io } from "socket.io-client"
import { Router } from './Router'
import {useState,useEffect} from 'react'
import { User } from './components/interfaces/User'
import { handleAutoLogin } from './utils'


function App() {
  const socket = io(`${window.location.hostname}:3001`, { autoConnect: false });
  useEffect(()=>{
    handleAutoLogin(setUser);
  },[])
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <SocketContext.Provider value={socket}>
        <ChakraProvider>
          <Router />
        </ChakraProvider>
      </SocketContext.Provider>
    </UserContext.Provider>
  );
}

export default App
