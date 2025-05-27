import {Link} from 'react-router-dom';
import { ThemeSwitcher } from '../components/ThemeSwitcher';

export const NotFound = () => {
  return (
    <>
    <div className='flex justify-end absolute w-full p-2 z-20'><ThemeSwitcher/></div>
    <div className="flex flex-col items-center justify-center h-screen bg-home">
        <p className="text-[32pt] text-center mt-20 font-bold">404 - Page Not Found</p>
        <p className="text-center mt-4">The page you are looking for does not exist.</p>
        <p className="text-center mt-2">Please check the URL or <Link to="/" ><span className='text-blue-500 underline'>return to the home page.</span></Link></p>
    </div>
    </>
  )
}
