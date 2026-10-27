import "./sidebar.css";
import { useContext, useEffect, useState } from "react";
import { Mycontext } from "./Mycontext";
import { v4 as uuidv4 } from "uuid";

function Sidebar() {
  const {
    allthread,
    setallthread,
    currThreadId,
    setcurrThreadId,
    setPrompt,
    setPrevchats,
    refreshThreads,
    historyError,
    setHistoryError,
  } = useContext(Mycontext);
  const [activeAction, setActiveAction] = useState("");

  useEffect(()=>{
    refreshThreads();
  }, [refreshThreads]);

  const createANewchat=()=>{
    setPrompt("");
    setPrevchats([]);
    setHistoryError("");
    setcurrThreadId(uuidv4());
  };

  const changeThread = async (threadid) => {
    if (threadid === currThreadId || activeAction) return;
    setActiveAction(threadid);
    setHistoryError("");
    try {
      const response = await fetch(`http://localhost:8080/api/thread/${encodeURIComponent(threadid)}`);
      const messages = await response.json();
      if (!response.ok) {
        throw new Error(messages.error || `Request failed (${response.status})`);
      }
      setPrevchats(messages);
      setPrompt("");
      setcurrThreadId(threadid);
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Unable to open this conversation.");
    } finally {
      setActiveAction("");
    }
  };

  const deleteThread = async (event, threadid) => {
    event.stopPropagation();
    if (activeAction) return;
    setActiveAction(threadid);
    setHistoryError("");
    try {
      const response = await fetch(`http://localhost:8080/api/thread/${encodeURIComponent(threadid)}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || `Request failed (${response.status})`);
      }
      setallthread(threads => threads.filter(thread => thread.threadid !== threadid));
      if (threadid === currThreadId) {
        createANewchat();
      }
    } catch (error) {
      setHistoryError(error instanceof Error ? error.message : "Unable to delete this conversation.");
    } finally {
      setActiveAction("");
    }
  };

  return (
    <aside className="sidebar">
      <button type="button" className="new-chat-button" onClick={createANewchat}>
        <div className="brand">
          <img src="src/assets/blacklogo.png" alt="gpt-logo" className="logo" />
          <span className="button-label">New chat</span>
        </div>
        <span className="icon-wrap">
          <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
        </span>
      </button>

      <ul className="history">
        {allthread.map(thread => (
          <li className={`history-item${thread.threadid === currThreadId ? " active" : ""}`} key={thread.threadid}>
            <button
              type="button"
              className="history-open"
              onClick={() => changeThread(thread.threadid)}
              disabled={Boolean(activeAction)}
              aria-current={thread.threadid === currThreadId ? "page" : undefined}
            >
              {thread.title || "New chat"}
            </button>
            <button
              type="button"
              className="history-delete"
              onClick={event => deleteThread(event, thread.threadid)}
              disabled={Boolean(activeAction)}
              aria-label={`Delete ${thread.title || "chat"}`}
              title="Delete chat"
            >
              <i className="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </li>
        ))}
      </ul>
      {historyError && <p className="history-error" role="alert">{historyError}</p>}

      <div className="sign">
        <p>
          By Harshit <span aria-label="love">&hearts;</span>
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;