import { useColorMode } from "@chakra-ui/react";
import { useRef, useState, useEffect } from "react";
import { ThemeSwitcher } from "../components/ThemeSwitcher";
import { FaHome, FaUserCircle } from "react-icons/fa";
import { useAuth } from "../contexts/useAuth";
import { MousePointer } from "../components/MousePointer";
import { Link } from "react-router-dom";

export const Settings = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { user,setUser } = useAuth();
  const [color, setColor] = useState(user?.prefColor || "#000000");
  useEffect(()=>{console.log(user)},[])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);

    try {
        const formData = new FormData();
        // Replace 'your-username' with the actual username variable if available
        if (!user || !user.username) {
            throw new Error("User is not authenticated or username is missing");
        }
        formData.append("username", user.username);
        formData.append("file", selectedFile);

        const response = await fetch("http://localhost:3001/profile-pic", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        const data = await response.json();
        console.log("Upload successful:", data);
        setUser((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : null); // Update user context with new avatar URL

    } catch (error) {
        // Optionally handle error
        console.error(error);
    } finally {
        setUploading(false);
    }
};

const handleSubmitColorChange = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!user) return;
  const response = await fetch("http://localhost:3001/color-change", {
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: user.username, color }),
  });
  return response.status
}

  return (
    <>
      <div className="flex justify-between absolute w-full p-2 z-20">
          <Link to="/" className={`border-4! ${isDark?"border-white!":"border-[#10141D]!"} transition-all duration-200 p-1 border-solid rounded-full cursor-pointer flex justify-center items-center hover:scale-110`}>  
            <FaHome size={30} />
          </Link>
        <ThemeSwitcher />
      </div>
      <div
        className="min-h-screen flex items-center justify-center transition-colors bg-home"
        style={{ backgroundColor: isDark ? "#1a202c" : "#f7fafc" }}
      ><div className="rounded-xl shadow-lg p-8 w-full max-w-md flex" style={{ backgroundColor: isDark ? "#2d3748" : "#fff" }}>
        <form
          onSubmit={handleUpload}
          className="flex flex-col items-center w-full justify-between h-[320px]"
          
        >
          <h2
            className="text-2xl font-bold text-center"
            style={{ color: isDark ? "#f7fafc" : "#1a202c" }}
          >
            Upload Profile Picture
          </h2>
          <div className="flex flex-col items-center">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden mb-4 border-4 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              style={{
                cursor: "pointer",
                backgroundColor: isDark ? "#4a5568" : "#e2e8f0",
                borderColor: isDark ? "#4a5568" : "#d1d5db"
              }}
              title="Change profile picture"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                user?.avatarUrl?<img
                  src={user.avatarUrl}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />:<FaUserCircle size={64} className="text-gray-500" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />

            
          </div>
                      <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`px-4 py-2 rounded hover:bg-green-500 transition cursor-pointer ${
              isDark ? "bg-green-700" : "bg-green-300"
              }`}
            >
              {uploading ? "Uploading..." : "Upload & Save"}
            </button>
        </form>
        <div className={`mx-4 border-2 ${isDark?"border-gray-600!":"border-gray-300!"} h-auto`} style={{ minHeight: "200px" }} />
        <form className="w-full flex flex-col items-center justify-between">
                  <h2
            className="text-2xl font-bold mb-6 text-center" 
            style={{ color: isDark ? "#f7fafc" : "#1a202c" }}
          >
            Change Color
          </h2>
          {user&&<MousePointer user={user} localMouse={{ x: 0, y: 0 }} isPreview/>}
          <input
            type="color"
            className={`w-20 mb-4 ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-md border-none focus:outline-none h-20`}
            style={{ padding: "10px" }}
            value={color}
            onChange={(e) => {setColor(e.target.value); setUser((prev) => prev ? { ...prev, prefColor: e.target.value } : null);}}
            ></input>
            
          <button
            type="submit"
            className={`px-4 py-2 rounded hover:bg-blue-500 transition cursor-pointer ${
              isDark ? "bg-blue-700" : "bg-blue-300"
            }`}
            onClick={async(e) => {
              e.preventDefault();
              const res = await handleSubmitColorChange(e);
              if (res === 200) {
                setUser((prev) => prev ? { ...prev, prefColor: color } : null);
                window.alert("Color changed successfully!");
              } else {
                window.alert("Failed to change color, please try again later.");
              }
            }}
          >
            Change Color
          </button>
        </form>
        </div>
      </div>
    </>
  );
};
