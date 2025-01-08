document.addEventListener('DOMContentLoaded', function() {
    // 视频播放功能
    const playButton = document.querySelector('.play-button');
    const vrScreen = document.querySelector('.vr-screen');
    
    if (playButton && vrScreen) {
        playButton.addEventListener('click', function() {
            // 创建视频元素
            const video = document.createElement('video');
            video.src = 'videos/vr-preview.mp4';
            video.controls = true;
            video.autoplay = true;
            video.style.position = 'absolute';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';

            // 替换预览图片
            vrScreen.innerHTML = '';
            vrScreen.appendChild(video);
        });
    }

    // 目的地卡片悬停效果
    const destinationCards = document.querySelectorAll('.destination-card');
    
    destinationCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.querySelector('img').style.transform = 'scale(1.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.querySelector('img').style.transform = 'scale(1)';
        });
    });

    // 体验按钮点击效果
    const tryButton = document.querySelector('.try-button');
    
    if (tryButton) {
        tryButton.addEventListener('click', function() {
            // 这里可以添加VR体验启动逻辑
            alert('即将开启VR体验模式！');
        });
    }

    // 探索按钮点击效果
    const exploreButtons = document.querySelectorAll('.explore-button');
    
    exploreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const destination = this.closest('.destination-card').querySelector('h3').textContent;
            alert(`准备探索 ${destination} 的VR之旅！`);
        });
    });

    // 下载按钮点击效果
    const downloadButtons = document.querySelectorAll('.download-button');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.textContent.trim();
            alert(`即将跳转到${platform}下载页面`);
        });
    });

    // 滚动动画效果
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .destination-card, .testimonial-card');
        
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
        const elements = document.querySelectorAll('.feature-card, .destination-card, .testimonial-card');
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

    // VR体验按钮效果
    const ctaButton = document.querySelector('.cta-button');
    
    if (ctaButton) {
        ctaButton.addEventListener('click', function() {
            // 这里可以添加启动VR体验的逻辑
            alert('准备开启您的VR神游之旅！');
        });
    }

    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 