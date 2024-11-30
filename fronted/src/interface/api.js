import shuntSpawner from "./shunt"
import { isDevMode, pythonFileName, logDirectoryName } from "./constant"

const getEnvironment = shuntSpawner(
  () => process.env
)(
  () => {
    if (isDevMode) {
      return process.env
    } else {
      const path = window.require("path");
      const fs = window.require("fs");
      const dotenv = window.require("dotenv");
      const dirPath = path.resolve(".");
      const envPath = path.join(dirPath, ".env");
      if (fs.existsSync(envPath)) {
        const buf = fs.readFileSync(envPath);
        return dotenv.parse(buf);
      } else {
        return Object();
      }
    }
  }
);

export const sendPromptsStream = async (prompts, attachedFilePath, operators) => {
  const { handleAddBubble } = operators;
  
  try {
    const response = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-jNRAesIpZAcoFaX2kP32JDGMeXWuJoCNs6cb5CVdd3mEJVGU'
      },
      body: JSON.stringify({
      "model": "gpt-3.5-turbo",
      "messages": [
         {
            "role": "system",
            "content": "You are an intelligent e-commerce assistant named ShopSmart AI. Your role is to help users with their online shopping needs. You provide personalized product recommendations, answer questions about product features, compare items, and assist with shopping decisions.",
         },
         {
            "role": "user",
            "content": prompts
         }
      ],
        "stream": true
      })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;
          
          try {
            const jsonData = JSON.parse(jsonStr);
            const content = jsonData.choices[0]?.delta?.content || '';
            accumulatedResponse += content;
            
            // 更新UI显示
            handleAddBubble(false, accumulatedResponse, null);
          } catch (e) {
            console.error('解析错误:', e);
          }
        }
      }
    }

    return accumulatedResponse;
  } catch (error) {
    throw new Error(error.message);
  }
};

// 2. 添加非流式响应的 sendPromptsNonStream 函数
export const sendPromptsNonStream = async (prompts, attachedFilePath, operators) => {
  const { handleAddBubble } = operators;
  try {
    const response = await fetch('http://10.64.87.40:10012/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: prompts
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const message = data.response || "No response received.";
    handleAddBubble(false, message, null);
    return message;

  } catch (error) {
    console.error("Error in sendPromptsNonStream:", error.message);
    throw new Error(error.message);
  }
};

// 默认导出
export const sendPrompts = sendPromptsNonStream;

