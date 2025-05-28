import { FaUserCircle } from "react-icons/fa";
import { User } from "./interfaces/User";
import { useEffect, useState } from "react";

interface MousePointerProps {
    user: User;
    localMouse?:{x:number,y:number},
    isPreview?: boolean;
}

export const MousePointer = ({ user, localMouse, isPreview }: MousePointerProps) => {
    const [userIsClose, setUserIsClose] = useState(false);

    useEffect(() => {
        if (isPreview||!localMouse) return;
        const distance = Math.sqrt(
            Math.pow((user?.mouse?.x ?? 0) + 20 - localMouse.x, 2) +
            Math.pow((user?.mouse?.y ?? 0) + 20 - localMouse.y, 2)
        );
        setUserIsClose(distance < 50);
    }, [localMouse, isPreview, user?.mouse?.x, user?.mouse?.y]);

    const pointerContent = (
        <>
            <div
                className={`w-fit p-1 rounded-full rounded-tl-none`}
                style={{ backgroundColor: user.prefColor || undefined }}
                // fallback to blue-500 if no prefColor
                {...(!user.prefColor && { className: `w-fit p-1 rounded-full rounded-tl-none bg-blue-500` })}
            >
                {user.avatarUrl ? (
                    <div
                        className="w-8 h-8 bg-cover bg-center rounded-full"
                        style={{ backgroundImage: `url(${user.avatarUrl})` }}
                    ></div>
                ) : (
                    <FaUserCircle size={25} />
                )}
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
        </>
    );

    if (isPreview) {
        return (
            <div className="flex flex-col items-center justify-center w-fit z-10">
                {pointerContent}
            </div>
        );
    }

    return (
        <div
            className={`flex flex-col items-center justify-center w-fit z-10 absolute transition-opacity duration-100 pointer-events-none ${userIsClose && "opacity-20"}`}
            style={{
                left: `${((user?.mouse?.x ?? 0) / 1720) * 100}%`,
                top: `${((user?.mouse?.y ?? 0) / 700) * 100}%`
            }}
        >
            {pointerContent}
        </div>
    );
};
