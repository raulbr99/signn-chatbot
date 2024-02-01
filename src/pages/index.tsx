import { getTemplateById, createTemplate } from '@/firebase/firestore';
import Chatbot from '../components/Chatbot';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPage, GetServerSideProps } from 'next';

interface HomeProps {
  data: any; // You might want to replace `any` with a more specific type that matches your data structure
}

const Home: NextPage<HomeProps> = ({ data }) => {
  const templates = ["mutual_consent", "non_disclosure", "real_state"];
  const router = useRouter();

  // Use the template query parameter as the initial state if it exists and is valid
  const initialTemplate = templates.includes(router.query.template as string) ? router.query.template as string : templates[0];
  const [template, setTemplate] = useState<string>(initialTemplate);

  useEffect(() => {
    // Update the select dropdown when the URL changes
    if (templates.includes(router.query.template as string)) {
      setTemplate(router.query.template as string);
    }
  }, [router.query.template]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplate(e.target.value);
    window.location.href = `/?template=${e.target.value}`;
  };

  return (
    <main className="flex flex-col items-center w-full h-screen md:p-24">
      <div className='my-2'>
        <button onClick={createTemplate} className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-colors">ADD TEMPLATE</button>
        <select
          name="templates"
          id="template-select"
          onChange={handleTemplateChange}
          value={template}
          className="ml-4 appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-blue-500 shadow-md hover:border-gray-400"
        >
          <option value="">-- Choose a template --</option>
          {templates.map((templateId) => (
            <option key={templateId} value={templateId}>{templateId.replace(/_/g, ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>
      <h1 className="text-2xl font-bold">SIGNN CHATBOT</h1>
      <div className="flex-1 w-full">
        <Chatbot data={data} />
      </div>
    </main>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const template = query.template || 'mutual_consent'; // Default to 'mutual_consent' if no template is provided
  const data = await getTemplateById(template as string);

  return {
    props: {
      data: JSON.parse(JSON.stringify(data)),
    },
  };
};

export default Home;
