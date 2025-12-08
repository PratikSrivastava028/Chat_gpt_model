import React from 'react';

export default function Sidebar(props){
  const {
    previousChats, getOrderedChats, activeChatId, openChat,
    createNewChat, menuOpenId, setMenuOpenId, deleteChat,
    togglePin, toggleArchive, setRenameId, setRenameValue, renameId, renameValue, confirmRename,
    user, userMenuOpen, setUserMenuOpen, showSidebar, setShowSidebar, sidebarCollapsed
  } = props;
  // optional setter for collapsing sidebar on desktop (passed from Home)
  const { setSidebarCollapsed } = props;

  const chats = getOrderedChats();

  return (
    <aside className="chat-sidebar" aria-hidden={sidebarCollapsed || (!showSidebar && window.innerWidth < 768)}>
      <div className="sidebar-inner">
        <div className="sidebar-top">
          <div className="sidebar-header-row">
            <button
              className="sidebar-hamburger"
              aria-label="Toggle chats"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setShowSidebar(s => !s);
                } else if (typeof setSidebarCollapsed === 'function') {
                  setSidebarCollapsed(s => !s);
                }
              }}
            >☰</button>
            <div className="header-separator" aria-hidden></div>
            <h2 className="sidebar-title">AI Chat</h2>
          </div>
          <div className="sidebar-subtitle">Previous Chats</div>
        </div>

        <ul className="chats-list">
          {previousChats.length===0 && <li className="empty">No previous chats</li>}
          {chats.map(chat=> (
            <li key={chat.id} className={`chat-item ${chat.id===activeChatId? 'active':''} ${chat.archived? 'archived':''}`}>
              <div className="chat-item-main" onClick={()=>openChat(chat)}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  {chat.pinned && <span className="pin-icon" aria-hidden>📌</span>}
                  <div className="chat-item-title">{chat.title}</div>
                </div>
                <div className="chat-item-time">{new Date(chat.lastActivity).toLocaleString()}</div>
              </div>

              <div className="chat-item-controls">
                <button className="control-trigger" onClick={(e)=>{ e.stopPropagation(); setMenuOpenId(menuOpenId===chat.id? null: chat.id); setRenameId(null); }} aria-label="Chat options">⋯</button>
                {menuOpenId===chat.id && (
                  <div className="chat-menu" onClick={(e)=>e.stopPropagation()}>
                    <button onClick={()=>{ deleteChat(chat.id); setMenuOpenId(null); }}>Delete</button>
                    <button onClick={()=>{ togglePin(chat.id); setMenuOpenId(null); }}>{chat.pinned? 'Unpin':'Pin'}</button>
                    <button onClick={()=>{ toggleArchive(chat.id); setMenuOpenId(null); }}>{chat.archived? 'Unarchive':'Archive'}</button>
                    <button onClick={()=>{ setRenameId(chat.id); setRenameValue(chat.title); setMenuOpenId(null); }}>Rename</button>
                  </div>
                )}
              </div>

              {renameId===chat.id && (
                <div className="rename-overlay" onClick={(e)=>e.stopPropagation()}>
                  <input className="rename-input" value={renameValue} onChange={e=>setRenameValue(e.target.value)} />
                  <div className="rename-actions">
                    <button onClick={()=>confirmRename(chat.id)}>Save</button>
                    <button onClick={()=>{ setRenameId(null); setRenameValue(''); }}>Cancel</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div
            className="sidebar-user-trigger"
            onClick={(e)=>{
              e.stopPropagation();
              if(window.innerWidth < 768) setShowSidebar(true);
              setUserMenuOpen(s=>!s);
            }}
          >
            <div className="sidebar-user-avatar">{(user && user.name)? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U'}</div>
            <div className="sidebar-user-name">{(user && user.name) ? user.name : 'User'}</div>
            <div className="sidebar-user-caret">▾</div>
          </div>

          {userMenuOpen && (
            <div className="user-menu" onClick={(e)=>e.stopPropagation()}>
              <div className="user-menu-item user-menu-info">
                <div className="user-menu-avatar">{(user && user.name)? user.name.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U'}</div>
                <div>
                  <div className="user-menu-name">{(user && user.name) ? user.name : 'User'}</div>
                  <div className="user-menu-email">{(user && user.email) ? user.email : '—'}</div>
                </div>
              </div>
              <div className="user-menu-actions">
                <button onClick={()=>{ setUserMenuOpen(false); alert('Profile clicked'); }}>Profile</button>
                <button onClick={()=>{ setUserMenuOpen(false); alert('Logout clicked'); }}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
