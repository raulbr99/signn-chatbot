import { MessageDto } from "@/models/MessageDto";
import React from "react";
import axios from "axios";

interface MessageProps {
    message: MessageDto;
    messages: Array<any>
    templateId: string
}

const Message: React.FC<MessageProps> = ({ message, messages, templateId }) => {

    const generateContract = async () => {
        try {
            console.log("id: ", templateId)
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:8080/template/chat', {
                messages: messages,
                templateId: templateId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });
            console.log(response.data);
        } catch (error) {
            console.error('Error generating contract:', error);
            // Handle error
        }
    }

    return (
        message.role !== 'contract' ?
            <div className={`w-full mb-2 flex ${message.role === "user" ? 'justify-end' : 'justify-start'}`}
            >
                <div className={`inline-block break-words max-w-[90%] font-mono ${message.role === "user"
                    ? 'bg-[#128c7e] text-white rounded-tl-xl rounded-b-xl'
                    : 'bg-[#193835] text-white rounded-tr-xl rounded-b-xl'
                    } p-2`}
                >
                    {message.content.split("\n").map((text, index) => (
                        <span key={index}>
                            {text}
                            <br />
                        </span>
                    ))}
                </div>
            </div> :
            <div className="flex justify-center items-center my-4">
                <button onClick={generateContract} className="bg-gradient-to-r from-[#193835] to-[#128c7e] text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out active:scale-95">
                    GENERATE CONTRACT
                </button>
            </div>
    );

};

export default Message;