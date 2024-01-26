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
    const [model, setModel] = useState<any>("gpt-4");
    const [lastMessageText, setLastMessage] = useState<string>("")
    const chatContainerRef = useRef<HTMLDivElement>(null);

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
                content: 'Hi, I am SAIA, your artificial intelligence assistant. I am here to help you with your legal needs. What can I help you with today?',
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
            instructions: `To create a prompt for a chatbot that guides users through the process of contract creation, you should instruct the chatbot to conduct a clear and concise question-and-answer session. Each interaction should consist of one question from the chatbot and one response from the user. Here are the instructions for the chatbot:
            Greet the user and ask for the type of contract they need.
            After each user response, the chatbot should ask the next logical question to gather more specific details about the contract. Each question should be designed to elicit a short response.
            The chatbot should not make statements that imply a wait time or a process like "Preparing your contract," or "Generating contract" to avoid confusion in the 1:1 message exchange.
            Continue this pattern until the chatbot has collected all necessary information to generate the contract.
            This format ensures a smooth interaction where the user is guided step by step without any implied pause in the conversation, keeping the exchange active and focused.
            Begin with a polite greeting and ask for the specific type of contract the user needs to create.
            Proceed with a series of concise questions, each designed to collect a piece of information required for the contract, ensuring that each question naturally follows from the user's previous response.
            Maintain a professional and efficient tone throughout the conversation, avoiding any language that suggests the chatbot is unable to generate contracts.
            Once all necessary information is obtained, you have to send the exactly message "CONFIRM CONTRACT, just that exactly string in the response, dont use any more word".
            You have to do the question one by one. 
            `,
            model: model,
        });

        // create thread
        const thread = await openai.beta.threads.create();

        // set assistant and thread
        setAssistant(assistant);
        setThread(thread);
        setOpenai(openai);
    }

    const createNewMessage = (content: string, isUser: boolean, annotations: Array<any>) => {
        const newMessage = new MessageDto(isUser, content, annotations);
        return newMessage;
    }

    const handleSendMessage = async () => {
        messages.push(createNewMessage(input, true, []));
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
            response = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }


        setIsWaiting(false);

        // Get the message from the response
        const messageList = await openai.beta.threads.messages.list(thread.id);

        // Find the last message coming from the assistant
        const lastMessage = messageList.data.filter((message: any) => message.run_id === run.id && message.role === "assistant").pop();

        if (lastMessage) {
            console.log(lastMessage.content[0]);
            setLastMessage(lastMessage.content[0]["text"].value)
            //if(!lastMessage.content[0]["text"].value.includes("CONFIRM CONTRACT")) {
                setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, false, lastMessage.content[0].annotations)]);
            //}
        }
    };

    const handleKeyDown = (event: { key: string; }) => {
        if (event.key === 'Enter' && input !== "") {
            handleSendMessage();
        }
    };

    useEffect(() => {
        const scrollIntoLastMessage = () => {
            if (chatContainerRef.current) {
                const lastMessageElement = chatContainerRef.current.lastElementChild;
                lastMessageElement?.scrollIntoView({ behavior: "smooth" });
            }
        };

        scrollIntoLastMessage();
    }, [messages.length]);

    const createContract = () => {
        console.log("messages: ", messages)
    }

    return (
        <div className="flex flex-col h-full relative">
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-2 pb-20">
                {messages.map((message, index) => {
                    // Check if message content is "CONFIRM CONTRACT"
                    if (message.content.includes("CONFIRM CONTRACT")) {
                        return null; // Do not render this message
                    } else {
                        return <Message key={index} message={message} />; // Render other messages
                    }
                })}
            </div>

            {lastMessageText.includes("CONFIRM CONTRACT") && (
                <button onClick={createContract} className="fixed bottom-20 left-1/2 transform -translate-x-1/2 font-mono text-lg bg-blue-200 border-4 border-blue-400 text-black p-2 rounded-full transition duration-150">
                    GENERATE CONTRACT
                </button>
            )}

            <div className="mt-auto">
                <div className="p-4 bg-white shadow-inner flex-none fixed bottom-0 w-full">
                    <div className="flex flex-row">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="p-2 w-full border border-gray-300 rounded focus:outline-none focus:border-blue-500 transition duration-150"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isWaiting}
                            className={`ml-2 p-2 ${isWaiting ? 'bg-blue-300' : 'bg-blue-500'} text-white rounded hover:bg-blue-600 focus:outline-none transition duration-150`}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
