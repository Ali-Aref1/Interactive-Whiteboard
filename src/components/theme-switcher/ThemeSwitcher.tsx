import { useColorMode } from '@chakra-ui/react';
import "./style.css";
export const ThemeSwitcher = () => {
        
    const { colorMode, setColorMode } = useColorMode();
    if(colorMode=='dark'){
      document.documentElement.style.setProperty('--theme-switcher-bg','#0d1016');
      document.documentElement.style.setProperty('--theme-switcher-circle','#1c2330');
    }
    else{
      document.documentElement.style.setProperty('--theme-switcher-bg','#a1a1a1');
      document.documentElement.style.setProperty('--theme-switcher-circle','#ffffff');
    }
    const toggleColorMode = () => {
      setColorMode(colorMode == 'light' ? 'dark' : 'light')
      if(colorMode=='light'){
        document.documentElement.style.setProperty('--theme-switcher-bg','#0d1016');
        document.documentElement.style.setProperty('--theme-switcher-circle','#1c2330');
      }
      else{
        document.documentElement.style.setProperty('--theme-switcher-bg','#a1a1a1');
        document.documentElement.style.setProperty('--theme-switcher-circle','#ffffff');
      }
      
    }
    if(colorMode == 'light') {
  return (
    <div id="theme-switcher">
        <input type="checkbox" id="check" onChange={toggleColorMode}></input>
        <label htmlFor="check"></label> 
    </div>
  )
    }
    else return(
    <div id="theme-switcher">
        <input type="checkbox" id="check" onChange={toggleColorMode} checked></input>
        <label htmlFor="check"></label> 
    </div>
    )
}
