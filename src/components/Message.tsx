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
            const response = await axios.post('http://localhost:8080/template/chat', {
                messages: messages,
                templateId: templateId
            });
            console.log(response.data);
            // Handle the response data as needed
        } catch (error) {
            console.error('Error generating contract:', error);
            // Handle error
        }
    }

    return (
        message.role !== 'contract' ?
            <div className={`p-2 ${message.role === "user"
                ? 'bg-blue-500 text-white rounded-tl-xl rounded-b-xl ml-auto'
                : 'bg-gray-300 text-gray-700 rounded-tr-xl rounded-b-xl'
                }  max-w-[90%]`}
            >
                {message.content.split("\n").map((text, index) => (
                    <React.Fragment key={index}>
                        {text}
                        <br />
                    </React.Fragment>
                ))}
            </div> :
            <div className="flex justify-center items-center my-4">
                <button onClick={generateContract} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out active:scale-95">
                    GENERATE TEMPLATE
                </button>
            </div>
    );
    
};

export default Message;