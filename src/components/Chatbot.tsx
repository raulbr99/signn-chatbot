import React, { use, useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import Message from './Message';
import { MessageDto } from '@/models/MessageDto';

const Chatbot = () => {
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [assistant, setAssistant] = useState<any>(null);
    const [thread, setThread] = useState<any>(null);
    const [openai, setOpenai] = useState<any>(null);

    /* const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
    }); */

    useEffect(() => {
        initChatbot();
    }, []);

    useEffect(() => {
        setMessages([
            {
                content: 'Hi, I am your contract creation chatbot. What type of contract would you like to create?',
                isUser: false,
            }
        ])
    }, [assistant]);

    const initChatbot = async () => {
        const openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });

        // create assistant
        const assistant = await openai.beta.assistants.create({
            name: 'Contract Creation Chatbot',
            instructions: "You are an advanced contract creation chatbot. Your primary role is to guide users through the process of generating personalized contracts tailored to their specific needs. Your objective is to elicit comprehensive information from users by asking one clear and relevant question at a time. Initiate the conversation by inquiring about the type of contract the user requires. Subsequently, proceed with distinct questions covering terms, conditions, parties involved, and any specific clauses desired by the user. Upon receiving all necessary information, your task is to dynamically generate a contract using the specific data provided by the user. Ensure that the contract is formatted correctly and includes all relevant details. Maintain a professional and trustworthy tone throughout the interaction to instill confidence in the accuracy and completeness of the generated contract. Your overarching goal is to streamline the contract creation process, providing a seamless and user-friendly experience for clients. Adjust your queries based on user responses to ensure a coherent and effective dialogue.",
            model: 'gpt-3.5-turbo-1106',
        });

        // create thread
        const thread = await openai.beta.threads.create();

        // set assistant and thread
        setAssistant(assistant);
        setThread(thread);
        setOpenai(openai);
    }

    const createNewMessage = (content: string, isUser: boolean) => {
        const newMessage = new MessageDto(isUser, content);
        return newMessage;
    }

    const handleSendMessage = async () => {
        messages.push(createNewMessage(input, true));
        setMessages([...messages]);
        setInput('');

        // send message to the thread
        await openai.beta.threads.messages.create(thread.id, {
            role: "user",
            content: input
        });

        // Run the assistant
        const run = await openai.beta.threads.runs.create(thread.id, {
            assistant_id: assistant.id,
        })

        // Create a response 
        let response = await openai.beta.threads.runs.retrieve(thread.id, run.id);

        // wait for the response
        while (response.status === 'in_progress' || response.status === 'queued') {
            console.log('waiting for response...');
            setIsWaiting(true);
            await new Promise((resolve) => setTimeout(resolve, 10000));
            response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        setIsWaiting(false);

        // Get the message from the response
        const messageList = await openai.beta.threads.messages.list(thread.id);

        // Find the last message coming from the assistant
        const lastMessage = messageList.data.filter((message: any) => message.run_id === run.id && message.role === "assistant").pop();

        if (lastMessage) {
            console.log(lastMessage.content[0]["text"].value);
            setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, false)]);
        }
    };

    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    };

    /* useEffect(() => {
        // Scroll to the bottom when a new message is added
        if (chatContainerRef.current) {
            const { scrollHeight, scrollTop, clientHeight } = chatContainerRef.current;
            const isScrolledToBottom = scrollHeight - scrollTop === clientHeight;

            if (!isScrolledToBottom) {
                const chatContainerRef = useRef<HTMLDivElement | null>(null);
                chatContainerRef.current?.scrollTo(0, chatContainerRef.current.scrollHeight);
            }
        }
    }, [messages]); */

    return (
        <div className="md:max-w-4xl w-full md:w-2/3 mx-auto mt-8 p-4 bg-gray-200 rounded-md">
            <div className="overflow-y-scroll md:max-h-[700px] min-h-full h- md:h-[700px] space-y-2 flex flex-col items-end">
                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
            </div>
            <div className="mt-4 flex flex-row">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <button
                    onClick={handleSendMessage}
                    className="ml-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
