import React, { useState } from 'react';
import { useColorMode } from '@chakra-ui/react';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth'
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const { colorMode } = useColorMode();
    const Navigate = useNavigate();
    const isDarkMode = colorMode === 'dark';
    const [form, setForm] = useState({ username: '', password: '' });
    const server = `${window.location.hostname}:3001`;

    const { setUser } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://${server}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });
            const data = await response.json();
            console.log(data)
            if (!response.ok) {
                window.alert(data.error || 'Login failed');
            } else {
                if (data) {
                    const newData = {
                        userId: data.id,
                        username: data.username,
                        email: data.email
                    }
                    setUser(newData);
                    Navigate('/draw');
                } else {
                    window.alert('Login successful but no user data returned');
                }
            }
        } catch (error) {
            window.alert(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };

    return (
        <>
        <div className='flex justify-end absolute w-full p-2 z-20'><ThemeSwitcher/></div>
        <div className='relative h-screen flex items-center justify-center bg-home'>
        <form
            onSubmit={handleSubmit}
            className={`max-w-sm mx-auto p-6 rounded-lg shadow-md ${
            isDarkMode
                ? 'bg-gray-800 text-gray-100 '
                : 'bg-white text-gray-900 border-[#a0aec0]! border-2!'
            }`}
        >
            <p className="text-2xl font-bold mb-6 text-center">Login</p>
            <div className="mb-4">
            <label className="block mb-1 font-medium" htmlFor="username">
                Username:
            </label>
            <input
                id="username"
                name="username"
                type="text"
                value={form.username}
                onChange={handleChange}
                required
                autoComplete="username"
                className={`w-full px-3! py-2 rounded-full border outline-none transition h-8 ${
                isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
            />
            </div>
            <div className="mb-6">
            <label className="block mb-1 font-medium" htmlFor="password">
                Password:
            </label>
            <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className={`w-full px-3! py-2 rounded-full border outline-none transition h-8 ${
                isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-400'
                    : 'bg-gray-100 border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
            />
            </div>
            <div
            onClick={handleSubmit}
            className={`w-full py-2 rounded font-semibold transition text-center cursor-pointer ${
                isDarkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            >
            Login
            </div>
            <Link
                to="/"
            >
                <div className={`block mt-4 w-full py-2 rounded font-semibold transition text-center ${
                    isDarkMode
                        ? 'bg-gray-600 hover:bg-gray-700 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}>
                Cancel
                </div>
            </Link>
        </form>
        </div>
        </>
    );
};