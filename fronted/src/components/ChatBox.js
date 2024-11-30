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
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.shiftKey) {
                // 按下 Enter 且未按下 Shift 时发送消息
                e.preventDefault(); // 阻止默认换行行为
                if (e.target.value.trim() !== "") {
                    onSendMessage(e.target.value);
                    e.target.value = ""; // 清空输入框
                }
            }else if (e.key === "Enter" && !e.shiftKey) {
                // 按下 Shift+Enter 时，允许换行
                // 在某些浏览器中，可能需要阻止默认行为以防止意外提交
                e.preventDefault();
                e.target.value += "\n"; // 在当前输入框中添加换行
            }
          }}
        />
        <button onClick={() => onSendMessage()}>发送</button>
      </div>
    </div>
  );
};

export default ChatBox; 