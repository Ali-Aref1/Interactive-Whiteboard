import { FaUserCircle } from "react-icons/fa";
import { User } from "./interfaces/User";

interface MousePointerProps {
    user: User;
}

export const MousePointer = ({ user }: MousePointerProps) => {
    return (
        <div className="flex flex-col items-center justify-center w-fit z-10 absolute" style={{ left: user.boardData?.mouse.x, top: user.boardData?.mouse.y }}>
            <div className="bg-red-500 w-fit p-1 rounded-full rounded-tl-none">
                <FaUserCircle size={25} />
            </div>
            {user.name && (
                <p
                    style={{
                        textShadow: `
                            -1px -1px 0 #222,  
                            1px -1px 0 #222,  
                            -1px 1px 0 #222,  
                            1px 1px 0 #222
                        `
                    }}
                >
                    {user.name}
                </p>
            )}
        </div>
    );
};
