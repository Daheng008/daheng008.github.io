document.addEventListener('DOMContentLoaded', function() {
    // MV列表数据
    const mvList = [
        {
            title: "青花瓷",
            path: "videos/青花瓷.mp4"
        },
        {
            title: "菊花台",
            path: "videos/菊花台.mp4"
        },
        {
            title: "双节棍",
            path: "videos/双节棍.mp4"
        },
        {
            title: "七里香",
            path: "videos/七里香.mp4"
        }
        // 可以继续添加更多MV
    ];

    const playlist = document.getElementById('playlist');
    const videoPlayer = document.getElementById('mvPlayer');
    let currentPlaying = null;

    // 设置默认视频
    if (mvList.length > 0) {
        videoPlayer.src = mvList[0].path;
    }

    // 创建播放列表项
    mvList.forEach((mv, index) => {
        const item = document.createElement('div');
        item.className = 'playlist-item';
        // 如果是第一个视频，添加active类
        if (index === 0) {
            item.classList.add('active');
            currentPlaying = item;
        }
        item.innerHTML = `
            <i class="fas fa-music"></i>
            <span>${mv.title}</span>
        `;
        
        item.addEventListener('click', () => {
            // 移除之前的活动状态
            if (currentPlaying) {
                currentPlaying.classList.remove('active');
            }
            
            // 设置新的活动状态
            item.classList.add('active');
            currentPlaying = item;
            
            // 播放视频
            videoPlayer.src = mv.path;
            videoPlayer.play();
        });
        
        playlist.appendChild(item);
    });

    // 添加视频结束事件监听器，自动播放下一个
    videoPlayer.addEventListener('ended', function() {
        const currentIndex = mvList.findIndex(mv => mv.path === videoPlayer.src.split('/').pop());
        const nextIndex = (currentIndex + 1) % mvList.length;
        const nextItem = playlist.children[nextIndex];
        if (nextItem) {
            nextItem.click();
        }
    });
}); 