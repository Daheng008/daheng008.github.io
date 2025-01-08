document.addEventListener('DOMContentLoaded', function() {
    // 初始化轮播
    const swiper = new Swiper('.swiper-container', {
        // 循环模式
        loop: true,
        
        // 自动播放
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        
        // 淡入淡出效果
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        
        // 分页器
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        
        // 导航按钮
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });

    // 添加社交媒体链接悬停效果
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });

    // 添加滚动动画
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-item, .team-member');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // 初始化元素状态
    const initializeElements = function() {
        const elements = document.querySelectorAll('.feature-item, .team-member');
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = 'all 0.6s ease-out';
        });
    };

    // 初始化
    initializeElements();
    animateOnScroll();

    // 监听滚动事件
    window.addEventListener('scroll', animateOnScroll);

    // 聊天界面功能
    const chatHistory = document.getElementById('chatHistory');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendMessage');
    const imageUpload = document.getElementById('imageUpload');
    const audioUpload = document.getElementById('audioUpload');
    const mediaPreview = document.getElementById('mediaPreview');

    // API配置
    const API_KEY = "1306759b68ba4a5eb069a794ad63f0e6.LmR80WS7ouJyn7k7";
    const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

    // 保存对话历史
    let conversationHistory = [];

    // 当前待发送的媒体文件
    let currentMedia = null;

    // 自动调整输入框高度
    function adjustTextareaHeight() {
        messageInput.style.height = 'auto';
        messageInput.style.height = (messageInput.scrollHeight) + 'px';
    }

    // 处理文件上传
    async function handleFileUpload(file, type) {
        if (!file) return null;

        try {
            // 将文件转换为base64
            const base64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });

            // 创建预览元素
            const previewItem = document.createElement('div');
            previewItem.className = 'media-preview-item';

            // 根据文件类型创建预览内容
            if (type === 'image') {
                const img = document.createElement('img');
                img.src = base64;
                previewItem.appendChild(img);
            } else if (type === 'audio') {
                const audio = document.createElement('audio');
                audio.src = base64;
                audio.controls = true;
                previewItem.appendChild(audio);
            }

            // 添加删除按钮
            const removeButton = document.createElement('div');
            removeButton.className = 'remove-media';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.onclick = () => {
                previewItem.remove();
                currentMedia = null;
            };
            previewItem.appendChild(removeButton);

            // 清除之前的预览
            mediaPreview.innerHTML = '';
            mediaPreview.appendChild(previewItem);

            // 保存当前媒体信息
            currentMedia = {
                type: type,
                data: base64,
                file: file
            };

        } catch (error) {
            console.error('文件处理错误:', error);
            alert('文件处理失败，请重试');
        }
    }

    // 添加新消息到聊天历史
    function addMessage(content, isUser = true, mediaContent = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
        
        const messageContentDiv = document.createElement('div');
        messageContentDiv.className = 'message-content';

        // 如果有媒体内容，添加媒体元素
        if (mediaContent) {
            const mediaElement = document.createElement('div');
            mediaElement.className = 'message-media';

            if (mediaContent.type === 'image') {
                const img = document.createElement('img');
                img.src = mediaContent.data;
                mediaElement.appendChild(img);
            } else if (mediaContent.type === 'audio') {
                const audio = document.createElement('audio');
                audio.src = mediaContent.data;
                audio.controls = true;
                mediaElement.appendChild(audio);
            }

            messageContentDiv.appendChild(mediaElement);
        }

        // 添加文本内容
        if (content) {
            const textElement = document.createElement('div');
            textElement.textContent = content;
            messageContentDiv.appendChild(textElement);
        }
        
        messageDiv.appendChild(messageContentDiv);
        chatHistory.appendChild(messageDiv);
        
        // 滚动到最新消息
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // 保存到对话历史
        const messageContents = [];
        if (mediaContent) {
            messageContents.push({
                type: mediaContent.type === 'image' ? 'image_url' : 'audio_url',
                [mediaContent.type === 'image' ? 'image_url' : 'audio_url']: {
                    url: mediaContent.data
                }
            });
        }
        if (content) {
            messageContents.push({
                type: 'text',
                text: content
            });
        }

        conversationHistory.push({
            role: isUser ? "user" : "assistant",
            content: messageContents
        });
    }

    // 添加加载指示器
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message ai-message loading';
        loadingDiv.id = 'loadingIndicator';
        
        const loadingContent = document.createElement('div');
        loadingContent.className = 'message-content';
        loadingContent.textContent = '正在思考...';
        
        loadingDiv.appendChild(loadingContent);
        chatHistory.appendChild(loadingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function removeLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
    }

    // 调用智谱API
    async function callZhipuAPI(userMessage) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "glm-4v-flash",
                    messages: [
                        {
                            role: "system",
                            content: [{
                                type: "text",
                                text: "你是环球神游的AI助手，负责回答用户关于公司产品、服务和团队的问题。你应该：1. 使用专业、友好的语气回答问题 2. 基于网站上的信息提供准确的回答 3. 重点介绍我们的旅游智伴、智能腰带等产品特点 4. 强调我们将科技与旅游相结合的创新理念"
                            }]
                        },
                        ...conversationHistory,
                        {
                            role: "user",
                            content: [{
                                type: "text",
                                text: userMessage
                            }]
                        }
                    ],
                    temperature: 0.7,
                    top_p: 0.8,
                    request_id: Date.now().toString(),
                    stream: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || '网络请求失败');
            }

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message) {
                const content = data.choices[0].message.content;
                return Array.isArray(content) ? content[0].text : content;
            } else {
                throw new Error('无效的API响应格式');
            }
        } catch (error) {
            console.error('API调用错误:', error);
            throw error;
        }
    }

    // 发送消息
    async function sendMessage() {
        const message = messageInput.value.trim();
        const media = currentMedia;

        if (!message && !media) return;

        try {
            // 添加用户消息
            addMessage(message, true, media);
            
            // 清空输入框和预览
            messageInput.value = '';
            mediaPreview.innerHTML = '';
            currentMedia = null;
            adjustTextareaHeight();
            
            // 显示加载状态
            sendButton.disabled = true;
            showLoadingIndicator();
            
            // 调用API获取回复
            const response = await callZhipuAPI(message);
            removeLoadingIndicator();
            addMessage(response, false);
        } catch (error) {
            console.error('发送消息错误:', error);
            removeLoadingIndicator();
            addMessage("抱歉，我暂时无法回答您的问题。请稍后再试。", false);
        } finally {
            // 恢复按钮状态
            sendButton.disabled = false;
        }
    }

    // 事件监听器
    messageInput.addEventListener('input', adjustTextareaHeight);
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendButton.addEventListener('click', sendMessage);

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file, 'image');
        }
    });

    audioUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFileUpload(file, 'audio');
        }
    });

    // 初始化输入框高度
    adjustTextareaHeight();

    const voiceInputButton = document.getElementById('voiceInput');
    const voiceInputStatus = document.querySelector('.voice-input-status');
    let isRecording = false;
    let recognition = null;

    // 初始化语音识别
    function initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'zh-CN';

            recognition.onstart = () => {
                isRecording = true;
                voiceInputButton.classList.add('recording');
                voiceInputStatus.style.display = 'block';
                messageInput.placeholder = '正在聆听...';
            };

            recognition.onend = () => {
                isRecording = false;
                voiceInputButton.classList.remove('recording');
                voiceInputStatus.style.display = 'none';
                messageInput.placeholder = '在这里输入你的消息...';
            };

            recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (finalTranscript) {
                    messageInput.value = finalTranscript;
                    adjustTextareaHeight();
                }
            };

            recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                if (event.error === 'not-allowed') {
                    alert('请允许使用麦克风以启用语音输入功能');
                }
                stopRecording();
            };
        } else {
            voiceInputButton.style.display = 'none';
            console.warn('当前浏览器不支持语音识别功能');
        }
    }

    // 开始录音
    function startRecording() {
        if (recognition && !isRecording) {
            recognition.start();
        }
    }

    // 停止录音
    function stopRecording() {
        if (recognition && isRecording) {
            recognition.stop();
        }
    }

    // 切换录音状态
    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    // 语音输入按钮事件监听
    voiceInputButton.addEventListener('click', toggleRecording);

    // 初始化语音识别
    initSpeechRecognition();
}); 