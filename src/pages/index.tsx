import Chatbot from '../components/Chatbot'

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full h-screen md:p-24">
      <h1 className="text-2xl font-bold">SIGNN CHATBOT</h1>
      <div className="flex-1 w-full">
        <Chatbot />
      </div>
    </main>
  );
}
