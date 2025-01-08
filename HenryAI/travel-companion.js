let map;
let marker;
let geocoder;
let placeSearch;
let autoComplete;

// 北京市中心坐标
const BEIJING_CENTER = [116.397428, 39.90923];

// 确保AMap加载完成
function waitForAMap() {
    return new Promise((resolve, reject) => {
        if (window.AMap) {
            resolve();
        } else {
            const timeout = setTimeout(() => {
                reject(new Error('AMap加载超时'));
            }, 5000);

            window.onAMapLoaded = () => {
                clearTimeout(timeout);
                resolve();
            };
        }
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('等待地图API加载...');
        await waitForAMap();
        
        console.log('初始化地图功能...');
        await initMap();
        // 确保地图先加载出来
        await showDefaultMap();
        
        // 初始化Live2D模型
        await initLive2DModel();
        
        initLocationServices();
        initCitySearch();
        initPlaceSearch();
        
        // 初始化其他功能
        initGuideInteraction();
    } catch (error) {
        console.error('初始化失败:', error);
        showError('页面加载失败，请检查网络连接后刷新页面');
    }
});

async function initMap() {
    return new Promise((resolve, reject) => {
        try {
            console.log('创建地图实例...');
            const mapContainer = document.getElementById('map-container');
            
            // 确保容器存在且有尺寸
            if (!mapContainer) {
                throw new Error('地图容器不存在');
            }
            
            // 设置容器尺寸
            mapContainer.style.height = '400px';
            mapContainer.style.width = '100%';
            
            map = new AMap.Map('map-container', {
                zoom: 11,
                viewMode: '3D',
                pitch: 30,
                mapStyle: 'amap://styles/dark',
                center: BEIJING_CENTER
            });
            
            // 监听地图加载完成事件
            map.on('complete', () => {
                console.log('地图加载完成');
                
                // 添加地图控件
                map.addControl(new AMap.Scale());
                map.addControl(new AMap.ToolBar());
                map.addControl(new AMap.HawkEye({isOpen: true}));
                map.addControl(new AMap.MapType());
                
                resolve();
            });
            
            // 监听地图加载错误事件
            map.on('error', (error) => {
                console.error('地图加载错误:', error);
                reject(error);
            });
        } catch (error) {
            console.error('地图初始化失败:', error);
            reject(error);
        }
    });
}

// 显示默认地图（北京）
function showDefaultMap() {
    try {
        console.log('显示默认地图（北京）...');
        if (!map) return;
        
        map.setCenter(BEIJING_CENTER);
        map.setZoom(11);
        
        // 添加默认标记
        if (marker) {
            marker.setPosition(BEIJING_CENTER);
        } else {
            marker = new AMap.Marker({
                position: BEIJING_CENTER,
                map: map,
                animation: 'AMAP_ANIMATION_DROP'
            });
        }
        
        // 添加圆形范围
        new AMap.Circle({
            center: BEIJING_CENTER,
            radius: 5000,  // 5公里范围
            strokeColor: '#4FACFE',
            strokeWeight: 2,
            strokeOpacity: 0.5,
            fillColor: '#4FACFE',
            fillOpacity: 0.1,
            map: map
        });
        
        // 搜索附近景点
        searchNearbyAttractions(BEIJING_CENTER);
        
        // 更新位置文本
        const locationText = document.querySelector('.location-text');
        if (locationText) {
            locationText.textContent = '当前位置：北京市';
        }
        
        console.log('默认地图显示成功');
    } catch (error) {
        console.error('显示默认地图失败:', error);
        showError('地图显示失败，请刷新页面重试');
    }
}

function initLocationServices() {
    const locationText = document.querySelector('.location-text');
    
    try {
        console.log('初始化地理编码服务...');
        geocoder = new AMap.Geocoder({
            city: "全国"
        });
        
        if (navigator.geolocation) {
            console.log('请求用户位置...');
            // 设置超时时间为5秒
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log('获取到用户位置:', latitude, longitude);
                    
                    // 逆地理编码
                    geocoder.getAddress([longitude, latitude], (status, result) => {
                        if (status === 'complete' && result.info === 'OK') {
                            const address = result.regeocode.formattedAddress;
                            console.log('解析到地址:', address);
                            locationText.textContent = `当前位置：${address}`;
                            
                            // 更新地图位置
                            updateMapLocation([longitude, latitude]);
                            // 搜索附近景点
                            searchNearbyAttractions([longitude, latitude]);
                        } else {
                            console.error('地址解析失败:', result);
                            showDefaultMap();
                        }
                    });
                },
                error => {
                    console.error('获取位置失败:', error);
                    showDefaultMap();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.log('浏览器不支持地理定位');
            showDefaultMap();
        }
    } catch (error) {
        console.error('位置服务初始化失败:', error);
        showDefaultMap();
    }
}

function updateMapLocation(position) {
    try {
        console.log('更新地图位置...');
        map.setCenter(position);
        
        if (marker) {
            marker.setPosition(position);
        } else {
            marker = new AMap.Marker({
                position: position,
                map: map,
                animation: 'AMAP_ANIMATION_DROP'
            });
        }
        
        // 添加圆形范围
        new AMap.Circle({
            center: position,
            radius: 5000,  // 5公里范围
            strokeColor: '#4FACFE',
            strokeWeight: 2,
            strokeOpacity: 0.5,
            fillColor: '#4FACFE',
            fillOpacity: 0.1,
            map: map
        });
        
        console.log('地图位置更新成功');
    } catch (error) {
        console.error('更新地图位置失败:', error);
    }
}

function searchNearbyAttractions(position) {
    try {
        console.log('搜索附近景点...');
        placeSearch = new AMap.PlaceSearch({
            type: '风景名胜',
            pageSize: 10,
            pageIndex: 1
        });
        
        placeSearch.searchNearBy('', position, 5000, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                console.log('找到附近景点:', result.poiList.pois.length);
                displayAttractions(result.poiList.pois);
            } else {
                console.error('景点搜索失败:', result);
            }
        });
    } catch (error) {
        console.error('搜索景点失败:', error);
    }
}

function displayAttractions(attractions) {
    const grid = document.querySelector('.attractions-grid');
    if (!grid) return;
    
    console.log('显示景点信息...');
    grid.innerHTML = attractions.map(attraction => `
        <div class="attraction-card" data-id="${attraction.id}">
            <div class="attraction-info">
                <h3>${attraction.name}</h3>
                <p>${attraction.address}</p>
                <span class="distance">${(attraction.distance / 1000).toFixed(1)}km</span>
                <button class="favorite-btn" onclick="toggleFavorite('${attraction.id}')">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
            <div class="attraction-actions">
                <button onclick="showRoute('${attraction.location.lng},${attraction.location.lat}')">
                    <i class="fas fa-route"></i> 导航
                </button>
                <button onclick="showDetails('${attraction.id}')">
                    <i class="fas fa-info-circle"></i> 详情
                </button>
            </div>
        </div>
    `).join('');
}

function initCitySearch() {
    try {
        console.log('初始化城市搜索...');
        const citySearch = document.querySelector('.city-search');
        const cityList = document.querySelector('.city-list');
        
        autoComplete = new AMap.AutoComplete({
            city: '全国'
        });
        
        if (citySearch) {
            citySearch.addEventListener('input', event => {
                const keyword = event.target.value.trim();
                if (keyword) {
                    autoComplete.search(keyword, (status, result) => {
                        if (status === 'complete' && result.info === 'OK') {
                            console.log('城市搜索结果:', result.tips.length);
                            cityList.innerHTML = result.tips
                                .filter(tip => tip.location)
                                .map(tip => `
                                    <div class="city-item" onclick="changeCity('${tip.name}', [${tip.location.lng}, ${tip.location.lat}])">
                                        ${tip.name}
                                    </div>
                                `).join('');
                        }
                    });
                }
            });
        }
    } catch (error) {
        console.error('城市搜索初始化失败:', error);
    }
}

function changeCity(cityName, location) {
    try {
        console.log('切换城市:', cityName);
        map.setCenter(location);
        map.setZoom(11);
        
        document.querySelector('.location-text').textContent = `当前位置：${cityName}`;
        document.querySelector('.city-modal').style.display = 'none';
        
        // 搜索新城市的景点
        searchNearbyAttractions(location);
    } catch (error) {
        console.error('切换城市失败:', error);
    }
}

function showRoute(destination) {
    try {
        console.log('显示导航路线...');
        const driving = new AMap.Driving({
            map: map,
            panel: "panel"
        });
        
        if (marker) {
            const start = marker.getPosition();
            driving.search(start, destination, (status, result) => {
                if (status === 'complete') {
                    console.log('导航路线计算成功');
                } else {
                    console.error('导航路线计算失败:', result);
                }
            });
        }
    } catch (error) {
        console.error('显示导航失败:', error);
    }
}

function showDetails(poiId) {
    try {
        console.log('获取景点详情:', poiId);
        placeSearch.getDetails(poiId, (status, result) => {
            if (status === 'complete' && result.info === 'OK') {
                console.log('景点详情:', result);
                // 这里可以添加显示详情的弹窗
                alert(`景点详情：${result.poiList.pois[0].name}\n${result.poiList.pois[0].address}`);
            }
        });
    } catch (error) {
        console.error('获取景点详情失败:', error);
    }
}

// 收藏功能
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

function toggleFavorite(poiId) {
    try {
        console.log('切换收藏状态:', poiId);
        const index = favorites.indexOf(poiId);
        if (index === -1) {
            favorites.push(poiId);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoriteButtons();
    } catch (error) {
        console.error('收藏操作失败:', error);
    }
}

function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const poiId = btn.closest('.attraction-card').dataset.id;
        const isFavorite = favorites.includes(poiId);
        btn.querySelector('i').style.color = isFavorite ? '#ff4444' : '#999';
    });
}

// 错误处理和状态提示
function showError(message) {
    console.error(message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(255, 0, 0, 0.8);
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

// 初始化地图插件
function initPlaceSearch() {
    try {
        console.log('初始化地点搜索服务...');
        placeSearch = new AMap.PlaceSearch({
            pageSize: 10,
            pageIndex: 1,
            extensions: 'all'
        });
    } catch (error) {
        console.error('地点搜索服务初始化失败:', error);
    }
}

// Live2D 模型控制
let live2dModel;
const modelPath = 'https://cdn.jsdelivr.net/gh/guansss/pixi-live2d-display/examples/models/haru/haru_greeter_t03.model3.json';

async function initLive2DModel() {
    try {
        console.log('初始化Live2D模型...');
        const canvas = document.getElementById('live2d-canvas');
        const app = new PIXI.Application({
            view: canvas,
            transparent: true,
            autoStart: true
        });

        // 加载模型
        const model = await PIXI.live2d.Live2DModel.from(modelPath);
        
        // 调整模型大小和位置
        model.scale.set(0.4);
        model.anchor.set(0.5, 0);
        model.position.set(app.view.width / 2, 0);
        
        // 添加模型到舞台
        app.stage.addChild(model);
        live2dModel = model;
        
        // 添加交互效果
        model.on('hit', (hitAreas) => {
            if (hitAreas.includes('body')) {
                playRandomMotion();
            }
        });
        
        // 自动随机动作
        setInterval(playRandomMotion, 10000);
        
        console.log('Live2D模型初始化成功');
    } catch (error) {
        console.error('Live2D模型初始化失败:', error);
        showError('导游模型加载失败，请刷新页面重试');
    }
}

function playRandomMotion() {
    if (!live2dModel) return;
    
    const motions = [
        'idle',
        'greeting',
        'happy',
        'explain'
    ];
    
    const randomMotion = motions[Math.floor(Math.random() * motions.length)];
    live2dModel.motion(randomMotion);
}

async function updateGuideMessage(message, withAnimation = true) {
    const messageElement = document.getElementById('guide-message');
    const guideContainer = messageElement.closest('.guide-speech-bubble');
    
    if (withAnimation) {
        guideContainer.classList.add('typing');
        messageElement.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 500));
        messageElement.textContent = message;
        
        messageElement.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        guideContainer.classList.remove('typing');
    } else {
        messageElement.textContent = message;
    }
}

function initGuideInteraction() {
    const guideMessages = {
        welcome: '你好！我是你的专属导游小悦，很高兴为你介绍当地的精彩景点。',
        location: '我看到你现在在%s附近，让我为你推荐一些有趣的地方吧！',
        search: '正在为你搜索附近的景点...',
        found: '太棒了！我找到了一些很棒的景点，你可以看看这些推荐。',
        noLocation: '我暂时无法获取你的位置，不过没关系，让我为你介绍北京的景点吧！'
    };
    
    // 监听位置更新
    document.addEventListener('locationUpdate', async (e) => {
        const location = e.detail;
        await updateGuideMessage(guideMessages.location.replace('%s', location));
        playRandomMotion();
    });
    
    // 监听景点搜索
    document.addEventListener('searchStart', async () => {
        await updateGuideMessage(guideMessages.search);
    });
    
    document.addEventListener('searchComplete', async () => {
        await updateGuideMessage(guideMessages.found);
        playRandomMotion();
    });
} 