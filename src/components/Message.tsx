import { MessageDto } from "@/models/MessageDto";
import React from "react";

interface MessageProps {
    message: MessageDto;
}

const Message: React.FC<MessageProps> = ({ message }) => {
    return (
        <div className={`p-2 w-auto max-w-[90%] ${message.isUser
            ? 'bg-blue-500 text-white rounded-tr-xl rounded-b-xl '
            : 'bg-gray-300 text-gray-700 rounded-tl-xl rounded-b-xl ml-auto'
            }`}
        >
            {message.content.split("\n").map((text, index) => (
                <>
                    {text}
                    <br />
                </>
            ))}
        </div>
    );
};

export default Message;