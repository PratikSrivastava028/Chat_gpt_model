import React, {useEffect, useRef, useState} from "react";
import Sidebar from '../components/Sidebar';
import ChatMain from '../components/ChatMain';

export default function Home(){
  const [previousChats, setPreviousChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]); // current chat messages
  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(()=>{
    function onResize(){ setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', onResize);
    // load saved chats from localStorage if present
    try{
      const raw = localStorage.getItem('previousChats');
      if(raw){
        const parsed = JSON.parse(raw);
        setPreviousChats(parsed);
        if(parsed.length) setActiveChatId(parsed[0].id);
      }
    }catch(e){/* ignore */}
  },[]);

  useEffect(()=>{
    function onResize(){ setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', onResize);
    return ()=> window.removeEventListener('resize', onResize);
  },[]);

  useEffect(()=>{
    // persist previous chats
    try{ localStorage.setItem('previousChats', JSON.stringify(previousChats)); }catch(e){}
  },[previousChats]);

  useEffect(()=>{
    // scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({behavior:'smooth'});
  },[messages]);

  // close menus when clicking outside
  useEffect(()=>{
    function onDocClick(e){
      const target = e.target;
      if(target.closest && (target.closest('.chat-menu') || target.closest('.control-trigger'))){
        return;
      }
      setMenuOpenId(null);
    }
    document.addEventListener('click', onDocClick);
    return ()=> document.removeEventListener('click', onDocClick);
  },[]);

  // close user menu when clicking outside
  useEffect(()=>{
    function onDocClick(e){
      const target = e.target;
      if(target.closest && (target.closest('.sidebar-footer') || target.closest('.user-menu') || target.closest('.sidebar-user-trigger'))){
        return;
      }
      setUserMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return ()=> document.removeEventListener('click', onDocClick);
  },[]);

  // Try to fetch logged-in user (best-effort). Adjust endpoint to your backend.
  useEffect(()=>{
    let mounted = true;
    async function fetchUser(){
      const endpoints = ['/api/user','/api/auth/user','/api/me'];
      for(const ep of endpoints){
        try{
          const res = await fetch(ep, { credentials: 'include' });
          if(!res.ok) continue;
          const data = await res.json();
          if(mounted) setUser(data);
          return;
        }catch(e){ /* ignore and try next */ }
      }
      // fallback: try reading from localStorage (if you store auth there)
      try{ const raw = localStorage.getItem('user'); if(raw && mounted) setUser(JSON.parse(raw)); }catch(e){}
    }
    fetchUser();
    return ()=> mounted = false;
  },[]);

  function createNewChat(){
    const id = Date.now().toString();
    const chat = { id, title: 'New Chat', lastActivity: new Date().toISOString(), pinned:false, archived:false };
    setPreviousChats(prev=>[chat,...prev]);
    setActiveChatId(id);
    setMessages([]);
    setShowSidebar(false);
  }

  function openChat(chat){
    setActiveChatId(chat.id);
    // For now, we don't persist per-chat messages; keep single conversation in `messages`.
    setShowSidebar(false);
  }

  function sendMessage(){
    const text = input.trim();
    if(!text) return;
    const userMsg = { id: Date.now().toString(), from: 'user', text, time: new Date().toISOString() };
    setMessages(prev=>[...prev, userMsg]);
    setInput('');
    try{ inputRef.current?.focus(); }catch(e){}

    // update or create a previous chat entry
    setPreviousChats(prev=>{
      const idx = prev.findIndex(c=>c.id===activeChatId);
      const title = text.length>40? text.slice(0,40)+'...' : text;
      if(idx===-1){
        const newChat = { id: activeChatId || Date.now().toString(), title, lastActivity: new Date().toISOString(), pinned:false, archived:false };
        return [newChat, ...prev];
      }else{
        const next = [...prev];
        next[idx] = {...next[idx], title, lastActivity: new Date().toISOString() };
        // move to front
        next.unshift(next.splice(idx,1)[0]);
        return next;
      }
    });

    // Simulated AI response (replace this with real API call)
    const prompt = text;
    // mark generating so UI can show typing indicator and disable send
    setIsGenerating(true);
    setTimeout(()=>{
      const aiMsg = { id: Date.now().toString()+"-ai", from: 'ai', text: generateFakeResponse(prompt), time: new Date().toISOString() };
      setMessages(prev=>[...prev, aiMsg]);
      setIsGenerating(false);
      try{ inputRef.current?.focus(); }catch(e){}
    }, 700 + Math.random()*700);
  }

  function deleteChat(id){
    setPreviousChats(prev=> prev.filter(c=>c.id!==id));
    if(activeChatId===id){ setMessages([]); setActiveChatId(null); }
    setMenuOpenId(null);
  }

  function togglePin(id){
    setPreviousChats(prev=>{
      const idx = prev.findIndex(c=>c.id===id);
      if(idx===-1) return prev;
      const next = [...prev];
      next[idx] = {...next[idx], pinned: !next[idx].pinned };
      // if pinned move to front
      if(next[idx].pinned){
        next.unshift(next.splice(idx,1)[0]);
      }
      return next;
    });
  }

  function toggleArchive(id){
    setPreviousChats(prev=> prev.map(c=> c.id===id? {...c, archived: !c.archived }: c));
  }

  function confirmRename(id){
    const v = renameValue.trim();
    if(!v) return;
    setPreviousChats(prev=> prev.map(c=> c.id===id? {...c, title: v }: c));
    setRenameId(null);
    setRenameValue('');
  }
  

  function generateFakeResponse(userText){
    // lightweight simulated response — echo + small transformation
    if(!userText) return "Hello — I'm your AI assistant. How can I help?";
    return `AI: I received your message — "${userText}". (This is a simulated reply.)`;
  }

  function handleKeyDown(e){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      sendMessage();
    }
  }

  // Derived ordered chats: pinned first, then others by lastActivity (newest first)
  function getOrderedChats(){
    const copy = [...previousChats];
    copy.sort((a,b)=>{
      if(Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned? -1: 1;
      const ta = new Date(a.lastActivity).getTime() || 0;
      const tb = new Date(b.lastActivity).getTime() || 0;
      return tb - ta;
    });
    return copy;
  }

  return (
    <div className="chat-page">

      {/* global hamburger: shown when sidebar is hidden on mobile or when collapsed on desktop */}
      <button
        className="global-hamburger"
        onClick={() => {
          if (isMobile) {
            setShowSidebar(s => !s);
          } else {
            setSidebarCollapsed(s => !s);
          }
        }}
        aria-label="Toggle chats"
        style={{ display: (isMobile ? (!showSidebar ? 'flex' : 'none') : (sidebarCollapsed ? 'flex' : 'none')) }}
      >☰</button>

      <div className={`chat-container ${showSidebar? 'show-sidebar':''} ${sidebarCollapsed? 'sidebar-collapsed':''}`}>
        <Sidebar
          previousChats={previousChats}
          getOrderedChats={getOrderedChats}
          activeChatId={activeChatId}
          openChat={openChat}
          createNewChat={createNewChat}
          setSidebarCollapsed={setSidebarCollapsed}
          menuOpenId={menuOpenId}
          setMenuOpenId={setMenuOpenId}
          deleteChat={deleteChat}
          togglePin={togglePin}
          toggleArchive={toggleArchive}
          setRenameId={setRenameId}
          setRenameValue={setRenameValue}
          renameId={renameId}
          renameValue={renameValue}
          confirmRename={confirmRename}
          user={user}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        <ChatMain
          messages={messages}
          messagesEndRef={messagesEndRef}
          input={input}
          setInput={setInput}
          handleKeyDown={handleKeyDown}
          sendMessage={sendMessage}
          isGenerating={isGenerating}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
}
