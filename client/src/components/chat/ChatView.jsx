import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage } from '../../services/api';
import './ChatView.css';

const ChatView = ({ configs, selectedConfig, setSelectedConfig }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Start lesson when a config is selected
  useEffect(() => {
    const startLesson = async () => {
      if (selectedConfig && configs.length > 0) {
        const selectedLesson = configs.find(config => config.id === selectedConfig);
        if (selectedLesson) {
          setIsLoading(true);
          try {
            // Send initial message to backend without showing in UI
            const response = await sendChatMessage(selectedConfig, [
              { role: "user", content: "start lesson" }
            ]);
            
            // Only show AI's response
            setMessages([{
              id: 1,
              text: response.response,
              role: "assistant"
            }]);
          } catch (err) {
            setError('Failed to start lesson. Please try again.');
            console.error('Chat error:', err);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };
    
    startLesson();
  }, [selectedConfig, configs]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConfig) return;
    
    // Add user message
    const userMessage = { id: messages.length + 1, text: newMessage, role: "user" };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setError(null);
    setIsLoading(true);
    
    try {
      // Format messages for API
      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.text
      }));
      chatMessages.push({ role: "user", content: newMessage });
      
      // Get AI response
      const response = await sendChatMessage(selectedConfig, chatMessages);
      
      // Add AI response to messages
      const assistantMessage = { 
        id: messages.length + 2, 
        text: response.response, 
        role: "assistant" 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="chat-view">
      <div className="config-selector">
        <label>Select Lesson:</label>
        <select 
          value={selectedConfig || ''} 
          onChange={(e) => setSelectedConfig(e.target.value)}
          disabled={!configs.length}
        >
          {configs.length ? (
            configs.map(config => (
              <option key={config.id} value={config.id}>
                {config.lessonTitle}
              </option>
            ))
          ) : (
            <option value="" disabled>No lessons available</option>
          )}
        </select>
      </div>
      
      <div className="chat-interface">
        <div className="messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.role}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.text}
              </ReactMarkdown>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              Thinking...
            </div>
          )}
          {error && (
            <div className="message error">
              {error}
            </div>
          )}
        </div>
        
        <form className="input-area" onSubmit={handleMessageSubmit}>
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            disabled={isLoading || !selectedConfig}
          />
          <button type="submit" disabled={isLoading || !selectedConfig}>
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView; 