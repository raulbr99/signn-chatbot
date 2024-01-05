import Image from 'next/image'
import Chatbot from '../components/Chatbot'

export default function Home() {
  return (
    <main className={`flex min-h-screen flex-col items-center  p-24 `}>
      <h1 className='text-2xl font-bold'> SIGNN CHATBOT </h1>
      <Chatbot />
    </main>
  )
}
