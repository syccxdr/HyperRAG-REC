import React from "react";
import "../components/ChatBox.css";

const ChatBox = ({ messages, onSendMessage }) => {
  return (
    <div className="chat-box">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.fromUser ? 'user' : 'bot'}`}>
            {message.content}
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="输入您的问题..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage(e.target.value);
              e.target.value = '';
            }
          }}
        />
        <button onClick={() => onSendMessage()}>发送</button>
      </div>
    </div>
  );
};

export default ChatBox; 