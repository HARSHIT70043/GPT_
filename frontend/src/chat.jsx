import "./chat.css";
import { useContext } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { Mycontext } from "./Mycontext";

export default function Chat() {

  const { newchats = [], prevchats = [] } = useContext(Mycontext);
  const chats = [...prevchats, ...newchats];
  


  return (
    <div className="chats" role="log" aria-label="Conversation" aria-live="polite">
      {chats.length === 0 ? (
        <h1 className="chat-empty-title">Here We Begin!</h1>
      ) : (
        chats.map((chat, idx) => (
          <article
            className={chat.role === "user" ? "userdiv" : "gptdiv"}
            key={`${chat.role}-${idx}`}
          >
            {chat.role === "user" ? (
              <p className="usermessage">{chat.content}</p>
            ) : (
              <div className="gptmessage">
                <Markdown rehypePlugins={[rehypeHighlight]}>{chat.content}</Markdown>
              </div>
            )}
          </article>
        ))
      )}
    </div>
  );
}
