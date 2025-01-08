class ChatAPI {
    constructor() {
        this.API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.API_KEY = '1306759b68ba4a5eb069a794ad63f0e6.LmR80WS7ouJyn7k7';
    }

    async sendMessage(message, imageUrl = null) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
        };

        let content = [];
        
        // 如果有图片，添加图片内容
        if (imageUrl) {
            content.push({
                type: "image_url",
                image_url: {
                    url: imageUrl
                }
            });
        }
        
        // 添加文本内容
        content.push({
            type: "text",
            text: message
        });

        const requestBody = {
            model: "glm-4v",
            messages: [{
                role: "user",
                content: content
            }],
            stream: false,
            temperature: 0.8,
            top_p: 0.6,
            max_tokens: 1024,
            request_id: Date.now().toString() // 添加请求ID
        };

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content;
            } else {
                throw new Error('Invalid response format from API');
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
} 