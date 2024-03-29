import React, { useEffect, useRef, useState } from 'react';
import OpenAI from 'openai';
import Message from './Message';
import { MessageDto } from '@/models/MessageDto';

const Chatbot: React.FC<any> = ({ data }) => {
    console.log("template: ", data) 
    const [isWaiting, setIsWaiting] = useState<boolean>(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [assistant, setAssistant] = useState<any>(null);
    const [thread, setThread] = useState<any>(null);
    const [openai, setOpenai] = useState<any>(null);
    const [model, setModel] = useState<any>("gpt-4");
    const [lastMessageText, setLastMessage] = useState<string>("")
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        initChatbot();
    }, []);

    useEffect(() => {
        setMessages([
            {
                content: `Hi, I am SAIA, your artificial intelligence assistant. I am here to help you to complete your ${data.name} contract`,
                role: "system",
            }
        ])
    }, [assistant]);

    const initChatbot = async () => {
        const openai = new OpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });

        const editTemplate = `
        You will have to ask to the user for the data in this JSON object: ${data.content} with the exactly fields
        You will have to ask the data for this template contract: ${data}
        you should instruct the chatbot to conduct a clear and concise question-and-answer session. Each interaction should consist of one question from the chatbot and one response from the user. Here are the instructions for the chatbot:
        Greet the user and tell the user that we are going to edit the template ${data.name}
        you have to make one question by response
        The chatbot should not make statements that imply a wait time or a process like "Preparing your contract," or "Generating contract" to avoid confusion in the 1:1 message exchange.
        Once all necessary information is obtained, you have to send the exactly message "CONFIRM CONTRACT, just that exactly string in the response, dont use any more word".
        `
        const customContract = `To create a prompt for a chatbot that guides users through the process of contract creation, you should instruct the chatbot to conduct a clear and concise question-and-answer session. Each interaction should consist of one question from the chatbot and one response from the user. Here are the instructions for the chatbot:
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
        You dont have to ask about personal questions like name or addresses becuase we already have the information about the users in our DB
        You will have to ask the data for this template contract: ${data}
        `
        // create assistant
        const assistant = await openai.beta.assistants.create({
            name: 'Contract Creation Chatbot',
            instructions: editTemplate,
            model: model,
        });

        // create thread
        const thread = await openai.beta.threads.create();

        // set assistant and thread
        setAssistant(assistant);
        setThread(thread);
        setOpenai(openai);
    }

    const createNewMessage = (content: string, role: string) => {
        const newMessage = new MessageDto(content, role);
        return newMessage;
    }

    const handleSendMessage = async () => {
        messages.push(createNewMessage(input, "user"));
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
        console.log("message: ", messageList)
        // Find the last message coming from the assistant
        const lastMessage = messageList.data.filter((message: any) => message.run_id === run.id && message.role === "assistant").pop();
        console.log("lastMessage", lastMessage)
        if (lastMessage) {
            console.log(lastMessage.content[0]);
            setLastMessage(lastMessage.content[0]["text"].value)
            if (!lastMessage.content[0]["text"].value.includes("CONFIRM CONTRACT")) {
                setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, "system")]);
            } else {
                setMessages([...messages, createNewMessage(lastMessage.content[0]["text"].value, "contract")]);
            }
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

    return (
        <div className="flex flex-col h-full relative">
            <div ref={chatContainerRef} className="flex-1 bg-[#ece5dd] overflow-y-auto p-4 space-y-2 pb-20">
                {messages.map((message, index) => {
                    //console.log(message)
                    return <Message key={index} message={message} messages={messages} templateId={data.id}/>;
                })}
            </div>

            <div className="mt-auto">
                <div className="p-4 bg-transparent flex-none fixed md:static bottom-0 w-full">
                    <div className="flex flex-row">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="py-2 px-4 text-white w-full border bg-[#193835] rounded-full focus:outline-none focus:border-[#128c7e] transition duration-150"
                        />
                        <button
                            onClick={handleSendMessage}
                            disabled={isWaiting}
                            className={`ml-2 p-2 font-mono ${isWaiting ? 'bg-[#91c5bf]' : 'bg-[#128c7e]'} text-white rounded-full hover:bg-blue-600 focus:outline-none transition duration-150`}
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
