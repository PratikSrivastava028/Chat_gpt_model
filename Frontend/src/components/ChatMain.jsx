import React from 'react';

export default function ChatMain({messages, messagesEndRef, input, setInput, handleKeyDown, sendMessage, isGenerating, inputRef}){
  return (
    <main className="chat-main">
      {messages.length===0 ? (
        <div className="hero">
          <h2 className="hero-title">Good to see you,</h2>
          <h2 className="hero-subtitle">Start a conversation — ask anything.</h2>

          <div className="hero-prompt">
            <button className="hero-add">+</button>
            <input ref={inputRef} className="hero-input" placeholder="Ask anything" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} />
            <button className="hero-action" onClick={sendMessage} aria-label="Send" disabled={isGenerating}>⏎</button>
          </div>
        </div>
      ) : (
        <>
          <div className="messages" role="log" aria-live="polite">
            {messages.map(m=> (
              <div key={m.id} className={`message ${m.from==='user'? 'message-user':'message-ai'}`}>
                <div className="message-body">{m.text}</div>
                <div className="message-time">{new Date(m.time).toLocaleTimeString()}</div>
              </div>
            ))}

            {isGenerating && (
              <div className="message message-ai message-typing" aria-hidden>
                <div className="message-body">
                  <span className="typing-dots" aria-hidden>
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="composer-wrap">
            <div className="composer-pill">
              <button className="composer-add" aria-label="New">+</button>
              <input
                ref={inputRef}
                className="composer-input"
                placeholder="Ask anything"
                value={input}
                onChange={e=>setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                type="text"
              />
                <div className="composer-right">
                <button className="btn btn-primary composer-send" onClick={sendMessage} aria-label="Send" disabled={isGenerating}>➤</button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
