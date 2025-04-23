
// ws客户端
// let userId = "user123"; // 客户端生成或服务器分配的ID
let currentConversationId = null;

// Mock data for conversations
const conversations = [
    {
        id: 'default',
        title: '默认聊天',
        messages: [{
            id: 'conversation-114514-0',
            sender: 'bot',
            name: 'DeepSeek Chat | 深度来袭',
            content: "雷猴，有什么需要帮助的吗？",
        }],
        sessionId: "114514",
    },
];

// DOM elements
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-message-btn');
const chatMessages = document.getElementById('chat-messages');
const newChatButton = document.getElementById('new-chat-btn');
const conversationItems = document.querySelectorAll('.conversation-item');

// Current active conversation
let currentConversation = conversations[0];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize icons
    // lucide.createIcons();

    // Handle conversation switching
    conversationItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            // Update active class
            conversationItems.forEach(i => i.classList.remove('bg-gray-100'));
            item.classList.add('bg-gray-100');
            
            // Update conversation
            currentConversation = conversations[index];
            
            // Update header title
            document.querySelector('.flex-1 h2').textContent = currentConversation.title;
            
            // Load messages for this conversation
            loadMessages(currentConversation);
        });
    });
    
    // Load messages for a conversation
    function loadMessages(conversation) {
        // Update lucide icons
        // lucide.createIcons();
        chatMessages.innerHTML = '';
        // Add conversation messages
        conversation.messages.forEach(message => {
            console.info(message.id)
            currentConversationId = message.id
            addMessageToUI(message, true);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Send message function
    function sendMessage() {
        const message = messageInput.value.trim();
        if (!message) return;

        // Create message object
        sendButton.disabled = true;
        sendButton.classList.add('opacity-50', 'cursor-not-allowed');

        const newMessage = {
            id: `conversation-${currentConversation.sessionId}-${currentConversation.messages.length}`,
            sender: 'user',
            name: 'lenz',
            time: getCurrentTime(),
            content: message
        };
        
        // Add to conversation
        currentConversation.messages.push(newMessage);
        
        // Clear input
        messageInput.value = '';
        
        // Add to UI
        addMessageToUI(newMessage);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Simulate bot response after a delay
        simulateBotResponse(message);
    }
    
    // Simulate bot response
    function simulateBotResponse(userMessage) {
        // Add typing indicator
        const typingElement = document.createElement('div');
        typingElement.className = 'mb-6 typing-container';
        typingElement.innerHTML = `
            <div class="flex items-start">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-600 lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <div class="flex-1">
                    <div class="font-medium mb-1">DeepSeek Chat | 深度来袭</div>
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(typingElement);
        // lucide.createIcons();
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        const message = encodeURIComponent(userMessage);

        const source = new EventSourcePolyfill(`/mcp/chat-stream?message=${message}`, {
            headers: {
                "X-Session-ID": currentConversation.sessionId
            }
        });
        // const source = new EventSource(`http://127.0.0.1:8080/api/chat-stream?message=${message}`);

        source.onmessage = (event) => {
            const json = event.data
            console.info(json)
            dealResponse(JSON.parse(json))
        };

        // 添加对结束事件的处理
        source.addEventListener('end', (event) => {
            // 关闭连接
            source.close();
            // 执行任何清理操作
            console.log('Stream ended');
        });

        // 添加错误处理
        source.onerror = (error) => {
            console.error('EventSource failed:', error);
            source.close();
        };
    }
    
    // Get current time formatted as MM/DD HH:MM
    function getCurrentTime() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${month}/${day} ${hours}:${minutes}`;
    }
    
    // Create new chat
    newChatButton.addEventListener('click', () => {
        // Create new conversation
        const newId = `chat-${Date.now()}`;
        const newSessionId = Math.random().toString(36).substring(2, 10);
        const newConversation = {
            id: newId,
            title: `New Chat ${conversations.length + 1}`,
            messages: [{
                id: `conversation-${newSessionId}-0`,
                sender: 'bot',
                name: 'DeepSeek Chat | 深度来袭',
                content: "雷猴，有什么需要帮助的吗？",
            }],
            sessionId: newSessionId,
        };
        
        // Add to conversations
        conversations.push(newConversation);
        
        // Create new conversation item in sidebar
        const sidebarList = document.querySelector('.flex-1.overflow-y-auto > div');
        const newItem = document.createElement('div');
        newItem.className = 'conversation-item hover:bg-gray-100 rounded-md p-2 mb-1 cursor-pointer';
        newItem.innerHTML = `
            <div class="font-medium text-sm">${newConversation.title}</div>
            <div class="text-xs text-gray-500 truncate">新建对话</div>
        `;
        
        // Add click event to new item
        newItem.addEventListener('click', () => {
            // Update active class
            document.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('bg-gray-100'));
            newItem.classList.add('bg-gray-100');
            
            // Update conversation
            currentConversation = newConversation;
            
            // Update header title
            document.querySelector('.flex-1 h2').textContent = currentConversation.title;
            
            // Load messages for this conversation
            loadMessages(currentConversation);
        });
        
        sidebarList.appendChild(newItem);
        
        // Switch to new conversation
        newItem.click();
    });
    
    // Handle send button click
    sendButton.addEventListener('click', sendMessage);
    
    // Handle enter key in message input
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Load initial default chat
    loadMessages(currentConversation);
});

// Add a message to the UI
function addMessageToUI(message, isLoad = false) {
    if (message.sender === 'user') {
        const messageElement = document.createElement('div');
        messageElement.className = 'mb-6';
        messageElement.innerHTML = `
            <div class="flex items-start">
                <div class="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white mr-4">
                    L
                </div>
                <div class="flex-1">
                    <div class="font-medium mb-1">${message.name} <span class="text-xs text-gray-500">${message.time}</span></div>
                    <div class="text-sm">
                        ${message.content}
                    </div>
                </div>
            </div>
        `;
        chatMessages.appendChild(messageElement);
    } else {
        if (message.tool_calls && message.tool_calls.length > 0) {
            const messageOutput = document.getElementById(currentConversationId);
            if (messageOutput) {
                const messageElement = document.createElement('details');
                messageElement.className = 'border-t first:border-t-0 border-gray-200 bg-gray-50';
                messageElement.id = message.tool_calls[0].id + '-details';
                messageElement.innerHTML = `
                    <summary class="cursor-pointer text-sm font-semibold select-none px-4 py-2 bg-gray-100 rounded-t-md">
                        ${message.tool_calls[0].function.name} <span id="${currentConversationId}-${message.tool_calls[0].id}-status" class="ml-2 text-gray-500">✖ 未完成</span>
                    </summary>
                    <div id="${currentConversationId}-${message.tool_calls[0].id}-content" class="px-4 py-3 bg-white rounded-b-md">
                        <!-- 初始内容为空 -->
                    </div>
                `;
                messageOutput.appendChild(messageElement);
            } else {
                const messageElement = document.createElement('div');
                messageElement.className = 'mb-6';
                messageElement.innerHTML = `
                    <div class="flex items-start">
                        <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-600 lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </div>
                        <div class="flex-1">
                            <div class="font-medium mb-1">${message.name}</div>
                            <div id="${currentConversationId}">
                                <details id="${message.tool_calls[0].id}-details" class="border-t first:border-t-0 border-gray-200 bg-gray-50">
                                    <summary class="cursor-pointer text-sm font-semibold select-none px-4 py-2 bg-gray-100 rounded-t-md">
                                        ${message.tool_calls[0].function.name} <span id="${currentConversationId}-${message.tool_calls[0].id}-status" class="ml-2 text-gray-500">✖ 未完成</span>
                                    </summary>
                                    <div id="${currentConversationId}-${message.tool_calls[0].id}-content" class="px-4 py-3 bg-white rounded-b-md">
                                        <!-- 初始内容为空 -->
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                `;
                chatMessages.appendChild(messageElement);
            }
        } else {
            const tool_call_id = message.tool_call_id
            if (tool_call_id) {
                // 获取元素
                const statusElement = document.getElementById(currentConversationId + '-' + tool_call_id + '-status');
                const contentElement = document.getElementById(currentConversationId + '-' + tool_call_id + '-content');

                // 更新状态为已完成
                statusElement.textContent = '✔ 已完成';
                statusElement.className = 'ml-2 text-green-500';

                // 更新内容
                contentElement.innerHTML = `<pre class="text-xs text-gray-800 whitespace-pre-wrap">${message.content}</pre>`;
            } else {
                let messageOutput = document.getElementById(currentConversationId);
                if (!messageOutput) {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'mb-6';
                    messageElement.innerHTML = `
                        <div class="flex items-start">
                            <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-600 lucide lucide-bot-icon lucide-bot"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                            </div>
                            <div class="flex-1">
                                <div class="font-medium mb-1">${message.name}</div>
                                <div id="${currentConversationId}">
                                </div>
                            </div>
                        </div>
                    `;
                    chatMessages.appendChild(messageElement);
                    messageOutput = document.getElementById(currentConversationId);
                }

                const messageElement = document.createElement('div');
                messageElement.className = 'text-sm whitespace-pre-wrap break-words'; // 关键样式
                messageOutput.appendChild(messageElement);

                if (isLoad) {
                    messageElement.innerHTML = parseBoldText(message.content); // 使用innerHTML
                    messageOutput.scrollTop = messageOutput.scrollHeight;
                } else {
                    // 流式输出
                    let index = 0;
                    const content = message.content;

                    const streamInterval = setInterval(() => {
                        if (index < content.length) {
                            const chunk = content.slice(0, index + 1);
                            messageElement.innerHTML = parseBoldText(chunk); // 使用innerHTML
                            index++;
                            messageOutput.scrollTop = messageOutput.scrollHeight;
                        } else {
                            clearInterval(streamInterval);
                            currentConversationId = null;
                            sendButton.disabled = false;
                            sendButton.classList.remove('opacity-50', 'cursor-not-allowed');
                        }
                    }, 10);
                }

            }
        }
    }
    
    // Update lucide icons
    // lucide.createIcons();
}

// 转换函数：将 **文本** 替换为 <strong>文本</strong>
function parseBoldText(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function dealResponse(json) {
    // Remove typing indicator
    const typingContainer = document.querySelector('.typing-container');
    if (typingContainer) {
        typingContainer.remove();
        currentConversationId = 'conversation-' + currentConversation.sessionId + '-' + currentConversation.messages.length;
    }

    // Create response message

    const botResponse = {
        id: currentConversationId,
        sender: 'bot',
        name: 'DeepSeek Chat | 深度来袭',
        content: json.content,
        tool_calls: json.tool_calls,
        tool_call_id: json.tool_call_id
    };
    // console.info(botResponse.content)
    // Add to conversation
    currentConversation.messages.push(botResponse);

    // Add to UI
    addMessageToUI(botResponse);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}