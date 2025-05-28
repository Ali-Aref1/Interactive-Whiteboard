import { FaUserCircle } from "react-icons/fa";
import { User } from "./interfaces/User";
import { useEffect, useState } from "react";

interface MousePointerProps {
    user: User;
    localMouse:{x:number,y:number}
}

export const MousePointer = ({ user,localMouse }: MousePointerProps) => {
    const [userIsClose, setUserIsClose] = useState(false);
    useEffect(() => {
        const distance = Math.sqrt(
        Math.pow((user.boardData?.mouse.x ?? 0)+20 - localMouse.x, 2) +
        Math.pow((user.boardData?.mouse.y ?? 0)+20 - localMouse.y, 2)
        );
        setUserIsClose(distance < 50); // Adjust the distance threshold as needed
    }, [localMouse]);

    return (
        <div className={`flex flex-col items-center justify-center w-fit z-10 absolute transition-opacity duration-100 pointer-events-none ${userIsClose&&"opacity-20"}`} style={{ left: user.boardData?.mouse.x, top: user.boardData?.mouse.y }}>
            <div className="bg-red-500 w-fit p-1 rounded-full rounded-tl-none">
                <FaUserCircle size={25} />
            </div>
            {user.username && (
                <p
                    style={{
                        textShadow: `
                            -1px -1px 0 #222,  
                            1px -1px 0 #222,  
                            -1px 1px 0 #222,  
                            1px 1px 0 #222
                        `
                    }}
                    className="select-none"
                >
                    {user.username}
                </p>
            )}
        </div>
    );
};
