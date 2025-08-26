import React, { useState, useRef, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, onSnapshot, doc, setDoc, orderBy, query } from 'firebase/firestore';
import '../styles/Chatbot.css';

const Chatbot = ({ appId, db }) => {
    const auth = getAuth();
    const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous';

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const chatWindowRef = useRef(null);

    // Fetch chat history from Firestore
    useEffect(() => {
        if (userId) {
            const chatCollectionRef = collection(db, "artifacts", appId, "users", userId, "chats");
            const q = query(chatCollectionRef, orderBy('createdAt', 'desc'));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedChats = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setChatHistory(fetchedChats);

                if (fetchedChats.length > 0 && !activeChatId) {
                    setActiveChatId(fetchedChats[0].id);
                }
            });

            return () => unsubscribe();
        }
    }, [userId, db, appId, activeChatId]);

    // Fetch messages for the active chat
    useEffect(() => {
        if (activeChatId) {
            const chatDocRef = doc(db, "artifacts", appId, "users", userId, "chats", activeChatId);
            const unsubscribe = onSnapshot(chatDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setMessages(docSnap.data().messages || []);
                }
            });
            return () => unsubscribe();
        }
    }, [activeChatId, db, userId, appId]);

    // Scroll to the bottom on new message
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user', timestamp: new Date() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');

        const chatDocRef = doc(db, "artifacts", appId, "users", userId, "chats", activeChatId);
        await setDoc(chatDocRef, { messages: updatedMessages }, { merge: true });

        const botMessage = { text: `Hello! You said: "${input}". This is a simulated response.`, sender: 'bot', timestamp: new Date() };
        const finalMessages = [...updatedMessages, botMessage];
        setMessages(finalMessages);
        await setDoc(chatDocRef, { messages: finalMessages }, { merge: true });
    };

    const handleNewChat = async () => {
        const newChatTitle = `New Chat - ${new Date().toLocaleDateString()}`;
        const chatCollectionRef = collection(db, "artifacts", appId, "users", userId, "chats");
        const chatDocRef = await addDoc(chatCollectionRef, {
            title: newChatTitle,
            messages: [],
            createdAt: new Date()
        });
        setActiveChatId(chatDocRef.id);
        setMessages([]);
    };

    const handleLoadChat = (chatId) => {
        setActiveChatId(chatId);
        setMessages([]);
    };

    return (
        <div className="chatbot-main-container">
            <div className={`chatbot-sidebar ${isSidebarOpen ? '' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>Chats</h2>
                    <button onClick={handleNewChat} className="new-chat-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus">
                            <path d="M5 12h14" /><path d="M12 5v14" />
                        </svg>
                    </button>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="toggle-sidebar-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left">
                            <path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/>
                        </svg>
                    </button>
                </div>
                <div className="chat-history-list">
                    {chatHistory.map(chat => (
                        <div key={chat.id} className={`chat-history-item ${activeChatId === chat.id ? 'active' : ''}`} onClick={() => handleLoadChat(chat.id)}>
                            {chat.title}
                        </div>
                    ))}
                </div>
            </div>
            <div className={`chatbot-chat-area ${isSidebarOpen ? '' : 'full-width'}`}>
                <div className="chat-window" ref={chatWindowRef}>
                    {messages.length === 0 && (
                        <div className="chat-intro-message">
                            <p>Hello! I am your financial assistant. How can I help you today?</p>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-bubble ${msg.sender}`}>
                            <p>{msg.text}</p>
                        </div>
                    ))}
                </div>
                <div className="chat-input-area">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask me a question..."
                    />
                    <button onClick={handleSendMessage} className="send-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizonal">
                            <path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;