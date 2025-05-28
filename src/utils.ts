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
                localStorage.setItem('InkSyncUser', JSON.stringify(newData));
                Navigate('/');
            } else {
                window.alert('Login successful but no user data returned');
            }
        }
    } catch (error) {
        window.alert(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
}

export const handleAutoLogin = (
  setUser: React.Dispatch<React.SetStateAction<any>>,
) => {
  const stored = localStorage.getItem('InkSyncUser');
  if (!stored) return;

  try {
    const user = JSON.parse(stored);
    // you can add extra checks here if you like
    setUser(user);
  } catch {
    console.warn('Failed to parse stored user');
  }
};

export const handleLogout = (
    setUser: React.Dispatch<React.SetStateAction<any>>,
    Navigate: ReturnType<typeof useNavigate>
) => {
    localStorage.removeItem('InkSyncUser');
    console.log('User logged out');
    setUser(null);
    Navigate('/');
}