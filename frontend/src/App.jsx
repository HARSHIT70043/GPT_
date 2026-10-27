import './App.css'
import Sidebar from './sidebar.jsx';
import ChartWindow from "./chartwindow.jsx";
import { Mycontext } from './Mycontext.jsx';
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
function App(){
  const [prompt, setPrompt]=useState("");
  const [currThreadId,setcurrThreadId]=useState(uuidv4());
  const[prevchats,setPrevchats]=useState([]); // store all the chats of the current state
  const [allthread,setallthread]=useState([]);
  const [historyError, setHistoryError] = useState("");

  const refreshThreads = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8080/api/thread");
      const threads = await response.json();
      if (!response.ok) {
        throw new Error(threads.error || `Request failed (${response.status})`);
      }
      setallthread(threads.map(({ threadid, title }) => ({ threadid, title })));
      setHistoryError("");
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Unable to load chat history.");
    }
  }, []);

  const providerValues={
    prompt , setPrompt,
    currThreadId ,setcurrThreadId,
    prevchats,setPrevchats,
    allthread,setallthread,
    refreshThreads,
    historyError,setHistoryError,
  };   //passing value

  return (
    <div className='app'>
      <Mycontext.Provider value={providerValues}>
      <Sidebar> </Sidebar>
      <ChartWindow></ChartWindow> 
      </Mycontext.Provider>
    </div>
  )
}


export default App
