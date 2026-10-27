import { useContext, useEffect, useRef, useState } from 'react';
import './chartwindow.css';
import Chat from './chat.jsx';
import { Mycontext } from './Mycontext.jsx';
// import App from './App.jsx';
import { BeatLoader } from 'react-spinners';
export default function ChartWindow() {
    const{prompt ,setPrompt ,currThreadId,setPrevchats,refreshThreads}=useContext(Mycontext);
    const [loading ,setLoading] =useState(false);
    const [requestError, setRequestError] = useState("");
    const [isListening, setIsListening] = useState(false);
    const speechRecognitionRef = useRef(null);
    const speechBasePromptRef = useRef("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    useEffect(() => () => {
      speechRecognitionRef.current?.abort();
    }, []);

    const toggleVoiceInput = () => {
      if (isListening) {
        speechRecognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      if (!SpeechRecognition) {
        setRequestError("Voice input is not supported by this browser.");
        return;
      }

      setRequestError("");
      speechBasePromptRef.current = prompt.trim();
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = event => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join("");
        setPrompt([speechBasePromptRef.current, transcript].filter(Boolean).join(" "));
      };
      recognition.onerror = event => {
        if (event.error !== "aborted") {
          setRequestError(
            event.error === "not-allowed"
              ? "Microphone access was denied. Allow microphone access and try again."
              : `Voice input failed: ${event.error}.`
          );
        }
        setIsListening(false);
      };
      recognition.onend = () => {
        setIsListening(false);
        speechRecognitionRef.current = null;
      };

      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        speechRecognitionRef.current = null;
        setIsListening(false);
        setRequestError(error instanceof Error ? error.message : "Could not start voice input.");
      }
    };

    const getReply =async ()=>{
    const message = prompt.trim();
    if (!message || loading) return;
    if (isListening) {
      speechRecognitionRef.current?.stop();
      setIsListening(false);
    }

    setLoading(true);
    setRequestError("");
    setPrompt("");
    setPrevchats(chats => [...chats, { role: "user", content: message }]);
       const options={
        method :"POST",
        headers :{
            "Content-Type":"application/json"
        },
        body :JSON.stringify({
            message,
            threadid:currThreadId,
        
    }
        )
       };

       try{
       const respond = await fetch("http://localhost:8080/api/chats", options);
       const res= await respond.json();
       if (!respond.ok) {
        throw new Error(res.error || `Request failed (${respond.status})`);
       }
       if (typeof res.reply !== "string") {
        throw new Error("The server returned an invalid reply.");
       }
       setPrevchats(chats => [...chats, { role: "assistant", content: res.reply }]);
       refreshThreads();
       }catch(error){
        setRequestError(error instanceof Error ? error.message : "Unable to get a reply.");
       } finally {
        setLoading(false);
       }
    }

  return (
    <main className="chartwindow">
      <header className="navbar">
        <div className="brand-name">
          <span>GptOpenAi</span>
          <i className="fa-solid fa-arrow-down" aria-hidden="true"></i>
        </div>

        <div className="usericondiv">
          <span className="userIcon" aria-label="User profile">
            <i className="fa-solid fa-user" aria-hidden="true"></i>
          </span>
        </div>
      </header>

      <Chat />
      {loading && (
        <div className="loader-overlay" role="status" aria-label="Generating response">
          <BeatLoader color="#4da3ff" size={14} />
        </div>
      )}
      <section className="chatinput">
        {requestError && <p className="request-error" role="alert">{requestError}</p>}
        <p className="info">ChatGPT can make mistakes. Check important info.</p>

        <div className="inputbox">
          <input
            type="text"
            placeholder="Ask anything"
            aria-label="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") getReply();
            }}
          />
          <button
            type="button"
            className={`voice-input${isListening ? " listening" : ""}`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
            title={
              SpeechRecognition
                ? isListening ? "Stop voice input" : "Dictate a message"
                : "Voice input is not supported by this browser"
            }
            onClick={toggleVoiceInput}
            disabled={loading || !SpeechRecognition}
          >
            <i className={`fa-solid ${isListening ? "fa-stop" : "fa-microphone"}`} aria-hidden="true"></i>
          </button>
          <button type="button" className="submit" aria-label="Send message" onClick={getReply} disabled={loading || !prompt.trim()}>
            <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
          </button>
       
        </div>
      </section>
    </main>
  );
}
