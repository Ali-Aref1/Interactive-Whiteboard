const server = `${window.location.hostname}:3001`;
import { useNavigate } from 'react-router-dom';

interface LoginFormData {
    username: string;
    password: string;
}

// setUser is a setState function for user state
export const handleLogin = async (
    formData: LoginFormData,
    setUser: React.Dispatch<React.SetStateAction<any>>,
    Navigate: ReturnType<typeof useNavigate>
) => {
    try {
        const response = await fetch(`http://${server}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
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
}