// 创建星星
function createStars() {
    const container = document.querySelector('.guide-stars');
    const starCount = 200;

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // 随机位置
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        
        // 随机大小
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // 随机动画延迟
        star.style.animationDelay = `${Math.random() * 3}s`;
        
        container.appendChild(star);
    }
}

// 初始化地球
function initGlobe() {
    const Globe = new ThreeGlobe()
        .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
        .atmosphereColor('rgb(79, 172, 254)')
        .atmosphereAltitude(0.15)
        .pointsData(locations)
        .pointColor(() => '#4FACFE')
        .pointAltitude(0.1)
        .pointRadius(0.5)
        .pointsMerge(true);

    // 配置场景
    const scene = new THREE.Scene();
    scene.add(Globe);
    scene.add(new THREE.AmbientLight(0xbbbbbb));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

    // 配置相机
    const camera = new THREE.PerspectiveCamera();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.z = 300;

    // 配置渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('globeViz').appendChild(renderer.domElement);

    // 添加控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.enableZoom = true;
    controls.minDistance = 200;
    controls.maxDistance = 500;

    // 自动旋转
    let frame = 0;
    function animate() {
        frame = requestAnimationFrame(animate);
        Globe.rotation.y += 0.001;
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // 窗口大小变化时更新
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // 点击事件处理
    renderer.domElement.addEventListener('click', event => {
        const mouse = new THREE.Vector2(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(Globe, true);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            const lat = 90 - Math.acos(point.y / Globe.scale.y) * 180 / Math.PI;
            const lng = ((270 + Math.atan2(point.x, point.z) * 180 / Math.PI) % 360) - 180;

            const location = findNearestLocation(lat, lng);
            if (location) {
                showLocationInfo(location);
            }
        }
    });
}

// 查找最近的位置
function findNearestLocation(lat, lng) {
    let nearest = null;
    let minDistance = Infinity;

    locations.forEach(loc => {
        const d = distance(lat, lng, loc.lat, loc.lng);
        if (d < minDistance) {
            minDistance = d;
            nearest = loc;
        }
    });

    return minDistance < 10 ? nearest : null;
}

// 计算两点之间的距离
function distance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 显示位置信息
function showLocationInfo(location) {
    const infoDiv = document.querySelector('.location-info');
    infoDiv.innerHTML = `
        <h2 class="location-title">${location.name}</h2>
        <p class="location-description">${location.description}</p>
        <div class="location-attractions">
            ${location.attractions.map(attraction => 
                `<div class="attraction">${attraction}</div>`
            ).join('')}
        </div>
    `;
    infoDiv.style.opacity = '1';
}

// 页面加载完成后初始化
window.addEventListener('load', () => {
    createStars();
    initGlobe();
}); 