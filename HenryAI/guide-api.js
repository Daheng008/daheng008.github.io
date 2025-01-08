class GuideAPI {
    constructor() {
        this.API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.API_KEY = '1306759b68ba4a5eb069a794ad63f0e6.LmR80WS7ouJyn7k7';
    }

    async sendMessage(message, context = '') {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.API_KEY}`
        };

        const prompt = `你现在是一位专业的旅游导游，名字叫小悦。${context ? '当前位置：' + context : ''}
请用专业、友好的语气回答游客的问题。回答要简洁、准确，并适当加入一些当地特色介绍。

游客问题：${message}`;

        const requestBody = {
            model: "glm-4v",
            messages: [{
                role: "user",
                content: [{
                    type: "text",
                    text: prompt
                }]
            }],
            stream: false,
            temperature: 0.7,
            top_p: 0.8,
            max_tokens: 1024
        };

        try {
            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }
} 