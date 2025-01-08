document.addEventListener('DOMContentLoaded', async function() {
    // 初始化3D模型
    initBeltModel();
    await updateHealthDashboard();
    // 初始化问答交互
    initQA();
    // 初始化购买按钮
    initPurchase();
    initTrackerSync();
    initWebSocket();
    
    // 每5分钟更新一次数据
    setInterval(updateHealthDashboard, 5 * 60 * 1000);
});

function initBeltModel() {
    // Three.js 3D模型展示
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    
    const container = document.getElementById('belt-model');
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 创建腰带模型（这里用简单几何体代替）
    const geometry = new THREE.TorusGeometry(3, 0.5, 16, 100);
    const material = new THREE.MeshPhongMaterial({ 
        color: 0x4FACFE,
        shininess: 100
    });
    const belt = new THREE.Mesh(geometry, material);
    scene.add(belt);

    camera.position.z = 10;

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        belt.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

async function fetchHealthData() {
    try {
        const response = await fetch('https://preview--mindful-belt-tracker.lovable.app/api/health-data');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching health data:', error);
        // 返回模拟数据作为备份
        return {
            analysis: {
                diet: '根据近期数据分析，建议增加膳食纤维的摄入。',
                exercise: '建议每天进行30分钟中等强度有氧运动。'
            }
        };
    }
}

async function updateHealthDashboard() {
    const healthData = await fetchHealthData();
    // 更新健康分析
    updateHealthAnalysis(healthData.analysis);
}

function updateHealthAnalysis(analysis) {
    const dietAdvice = document.getElementById('diet-advice');
    const exerciseAdvice = document.getElementById('exercise-advice');
    
    if (dietAdvice && analysis.diet) {
        dietAdvice.textContent = analysis.diet;
    }
    
    if (exerciseAdvice && analysis.exercise) {
        exerciseAdvice.textContent = analysis.exercise;
    }
}

function initQA() {
    const questions = document.querySelectorAll('.qa-item');
    
    questions.forEach(question => {
        question.querySelector('.question').addEventListener('click', () => {
            const isActive = question.classList.contains('active');
            
            // 关闭其他打开的问题
            questions.forEach(q => q.classList.remove('active'));
            
            // 切换当前问题的状态
            if (!isActive) {
                question.classList.add('active');
            }
        });
    });
}

function initPurchase() {
    const buyButton = document.querySelector('.buy-now');
    
    buyButton.addEventListener('click', () => {
        // 这里可以添加购买逻辑，比如跳转到支付页面
        alert('即将跳转到支付页面...');
    });
}

// 添加实时数据更新功能
let ws;

function initWebSocket() {
    ws = new WebSocket('wss://preview--mindful-belt-tracker.lovable.app/ws');
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.type === 'health_update') {
            updateHealthDashboard();
        }
    };
    
    ws.onclose = function() {
        // 如果连接断开，5秒后尝试重连
        setTimeout(initWebSocket, 5000);
    };
}

// 同步数据处理
function initTrackerSync() {
    const syncButton = document.getElementById('sync-data');
    const lastSyncSpan = document.getElementById('last-sync-time');
    const trackerFrame = document.getElementById('mindful-tracker');
    
    if (syncButton && lastSyncSpan) {
        syncButton.addEventListener('click', async () => {
            try {
                syncButton.disabled = true;
                syncButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 同步中...';
                
                // 从iframe获取数据
                trackerFrame.contentWindow.postMessage({ type: 'REQUEST_DATA' }, 'https://preview--mindful-belt-tracker.lovable.app/');
                
                // 更新同步时间
                const now = new Date();
                lastSyncSpan.textContent = now.toLocaleTimeString();
                
                await updateHealthDashboard();
                
                syncButton.innerHTML = '<i class="fas fa-check"></i> 同步成功';
                setTimeout(() => {
                    syncButton.innerHTML = '<i class="fas fa-sync"></i> 同步数据';
                    syncButton.disabled = false;
                }, 2000);
            } catch (error) {
                console.error('Sync failed:', error);
                syncButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> 同步失败';
                setTimeout(() => {
                    syncButton.innerHTML = '<i class="fas fa-sync"></i> 同步数据';
                    syncButton.disabled = false;
                }, 2000);
            }
        });
    }
}

// 处理来自iframe的消息
window.addEventListener('message', function(event) {
    if (event.origin !== 'https://preview--mindful-belt-tracker.lovable.app') {
        return;
    }
    
    const data = event.data;
    if (data.type === 'HEALTH_DATA') {
        // 更新本地数据
        updateHealthDashboard();
    }
}); 