document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentSlide = 0;
    
    // 创建轮播点
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.dot');
    
    function goToSlide(n) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = n;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        goToSlide((currentSlide + 1) % slides.length);
    }
    
    // 自动轮播
    setInterval(nextSlide, 4000);
});

// 聊天功能
document.addEventListener('DOMContentLoaded', function() {
    const chatHistory = document.querySelector('.chat-history');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.send-button');
    const chatAPI = new ChatAPI();
    let isProcessing = false;

    // 自动调整输入框高度
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // 发送消息
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message && !isProcessing) {
            isProcessing = true;
            sendButton.disabled = true;
            
            // 添加用户消息
            addMessage(message, 'user');
            chatInput.value = '';
            chatInput.style.height = 'auto';

            // 添加等待提示
            const loadingMessage = addMessage('正在思考...', 'ai');
            
            try {
                // 调用API获取回复
                const response = await chatAPI.sendMessage(message);
                // 移除等待提示
                loadingMessage.remove();
                // 添加AI回复
                addMessage(response, 'ai');
            } catch (error) {
                // 移除等待提示
                loadingMessage.remove();
                // 添加错误提示
                addMessage('抱歉，我遇到了一些问题，请稍后再试。', 'ai');
                console.error('Error:', error);
            } finally {
                isProcessing = false;
                sendButton.disabled = false;
            }
        }
    }

    // 添加消息到对话历史
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
            </div>
        `;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return messageDiv;
    }

    // 发送按钮点击事件
    sendButton.addEventListener('click', sendMessage);

    // 回车发送消息
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
}); 