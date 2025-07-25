// 全局变量存储配置
let appConfig = null;
let mediaObserver = null;

// 加载配置文件
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error('配置文件加载失败');
        }
    } catch (error) {
        console.warn('无法加载config.json:', error);
        return null;
    }
}

// 初始化OTP验证界面
async function initOTPVerification() {
    const config = await loadConfig();
    appConfig = config;
    const loadingMessage = document.getElementById('loadingMessage');
    const verifyButton = document.getElementById('verifyButton');
    if (config && config.otpSecret) {
        // 显示密钥
        verifyButton.disabled = false;
    }
}

// 验证码验证
document.getElementById('verifyButton').addEventListener('click', function () {
    const userInput = document.getElementById('otpInput').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    if (userInput.length !== 6 || !/^\d+$/.test(userInput)) {
        errorMessage.textContent = '请输入6位数字验证码';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        return;
    }
    if (appConfig && appConfig.otpSecret) {
        try {
            // 配置OTP验证参数
            otplib.authenticator.options = {
                algorithm: 'SHA1',
                digits: 6,
                period: 30,
                window: 1
            };
            // 验证OTP代码
            const isValid = otplib.authenticator.check(userInput, appConfig.otpSecret);
            if (isValid) {
                errorMessage.style.display = 'none';
                successMessage.style.display = 'block';
                // 延迟显示主要内容
                setTimeout(function () {
                    document.getElementById('verificationOverlay').style.display = 'none';
                    document.getElementById('mainContent').style.display = 'block';
                    // 初始化主内容
                    initMainContent();
                }, 1500);
            } else {
                // 尝试时间漂移补偿验证
                const now = Date.now();
                const driftWindow = 2; // 检查前后各2个周期
                let driftValid = false;
                for (let i = -driftWindow; i <= driftWindow; i++) {
                    const driftTime = now + (i * 30000);
                    if (otplib.authenticator.check(userInput, appConfig.otpSecret, { timestamp: driftTime })) {
                        driftValid = true;
                        break;
                    }
                }
                if (driftValid) {
                    errorMessage.style.display = 'none';
                    successMessage.style.display = 'block';
                    setTimeout(function () {
                        document.getElementById('verificationOverlay').style.display = 'none';
                        document.getElementById('mainContent').style.display = 'block';
                        initMainContent();
                    }, 1500);
                } else {
                    errorMessage.textContent = '验证码错误或已过期，请重新输入';
                    errorMessage.style.display = 'block';
                    successMessage.style.display = 'none';
                    document.getElementById('otpInput').value = '';
                    document.getElementById('otpInput').focus();
                }
            }
        } catch (error) {
            console.error('OTP验证错误:', error);
            errorMessage.textContent = `验证失败: ${error.message}`;
            errorMessage.style.display = 'block';
            successMessage.style.display = 'none';
        }
    } else {
        errorMessage.textContent = '系统配置错误';
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }
});

// 回车键验证
document.getElementById('otpInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('verifyButton').click();
    }
});

// 初始化Live2D看板娘
function initLive2D() {
    L2Dwidget.init({
        model: {
            jsonPath: "https://cdn.jsdelivr.net/npm/live2d-widget-model-hijiki@1.0.5/assets/hijiki.model.json",
            scale: 1
        },
        display: {
            position: "right",
            width: 150,
            height: 300,
            hOffset: 20,
            vOffset: -20
        },
        mobile: {
            show: true
        },
        react: {
            opacityDefault: 0.7,
            opacityOnHover: 0.2
        }
    });
}

// 创建随机飘落的爱心
function createFallingHearts() {
    const heart = document.createElement('div');
    heart.className = 'falling-heart';
    heart.innerHTML = '❤';
    
    // 随机水平位置
    const startX = Math.random() * window.innerWidth;
    heart.style.left = `${startX}px`;
    
    // 随机大小
    const size = Math.random() * 20 + 10; // 10px 到 30px
    heart.style.fontSize = `${size}px`;
    
    // 随机动画时长
    const duration = Math.random() * 5 + 5; // 5s 到 10s
    heart.style.animationDuration = `${duration}s`;
    
    // 随机透明度
    const opacity = Math.random() * 0.5 + 0.3; // 0.3 到 0.8
    heart.style.opacity = opacity;
    
    document.body.appendChild(heart);
    
    // 动画结束后移除元素
    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

// 开始飘落爱心动画
function startFallingHearts() {
    // 每隔300-800毫秒创建一个新爱心
    const interval = Math.random() * 500 + 300;
    setTimeout(() => {
        createFallingHearts();
        startFallingHearts(); // 递归调用，持续创建
    }, interval);
}

// 默认配置（如果无法加载外部配置文件）
const defaultConfig = {
    togetherDate: "2020-01-01 00:00:00",
    milestones: [
        {
            date: "2020-01-01",
            title: "初次相遇",
            description: "那是一个美好的开始，从此我们的生命交织在一起",
            image: "meeting.jpg"
        },
        {
            date: "2020-05-20",
            title: "第一次约会",
            description: "在那个浪漫的日子里，我们正式开始了恋爱之旅",
            image: "first_date.jpg"
        },
        {
            date: "2021-02-14",
            title: "第一个情人节",
            description: "粉色的玫瑰和甜蜜的巧克力，见证了我们的爱情",
            image: "valentine.jpg"
        },
        {
            date: "2021-10-01",
            title: "第一次旅行",
            description: "手牵手走过山川湖海，留下最美的回忆",
            image: "travel.jpg"
        },
        {
            date: "2022-06-15",
            title: "重要的纪念日",
            description: "这一天对我们来说意义非凡，永远铭记在心",
            image: "special_day.jpg"
        }
    ]
};

// 计算在一起的时间（年月日时分秒格式）
function calculateTogetherTime(startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diff = now - start;
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${years}年${months}月${days}日${hours}时${minutes}分${seconds}秒`;
}

// 更新在一起时间显示
function updateTogetherTime(startDate) {
    const timeDisplay = document.getElementById('togetherTime');
    timeDisplay.textContent = calculateTogetherTime(startDate);
}

// 图片/视频放大功能
function setupMediaModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    const closeBtn = document.querySelector('.close');

    // 点击图片或视频封面放大
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('timeline-image')) {
            // 显示图片
            modal.style.display = 'block';
            modalImg.src = e.target.src;
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
            document.body.style.overflow = 'hidden';
        } else if (e.target.classList.contains('timeline-video')) {
            // 点击视频本身 - 显示模态框中的视频并尝试播放
            const videoElement = e.target;
            const sourceElement = videoElement.querySelector('source');
            if (sourceElement) {
                modal.style.display = 'block';
                // 从 source 标签获取 src
                modalVideo.src = sourceElement.src;
                modalVideo.style.display = 'block';
                modalImg.style.display = 'none';
                document.body.style.overflow = 'hidden';

                // 尝试播放，需要用户手势，这里可能失败，但点击播放按钮会再次尝试
                // 这里不主动 play()，让模态框中的视频控件自己处理
            }
        } else if (e.target.classList.contains('play-button')) {
            // 点击播放按钮 - 显示模态框中的视频并播放
            e.preventDefault(); // 防止其他默认行为
            const videoContainer = e.target.closest('.media-container');
            const videoElement = videoContainer.querySelector('.timeline-video');
            const sourceElement = videoElement.querySelector('source');

            if (sourceElement) {
                modal.style.display = 'block';
                // 从 source 标签获取 src
                modalVideo.src = sourceElement.src;
                modalVideo.style.display = 'block';
                modalImg.style.display = 'none';
                document.body.style.overflow = 'hidden';

                // 尝试播放视频 - 这次是在用户点击事件处理函数内，应该可以成功
                const playPromise = modalVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("视频自动播放被阻止（这可能正常）:", error);
                        // 如果自动播放失败，用户可以点击模态框中的视频控件播放
                    });
                }
            }
        }
    });

    // 关闭模态框
    closeBtn.onclick = function () {
        modal.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = ""; // 清空 src 以停止加载
        document.body.style.overflow = 'auto';
    };

    // 点击模态框背景关闭
    modal.onclick = function (e) {
        if (e.target === modal) {
            closeBtn.onclick();
        }
    };

    // ESC键关闭
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeBtn.onclick();
        }
    });
}

// 音乐控制
function setupMusicControl() {
    const musicControl = document.getElementById('musicControl');
    const backgroundMusic = document.getElementById('backgroundMusic');
    let isPlaying = false;
    musicControl.addEventListener('click', function () {
        if (isPlaying) {
            backgroundMusic.pause();
            musicControl.textContent = '🎵';
            isPlaying = false;
        } else {
            backgroundMusic.play().catch(e => {
                console.log('自动播放被阻止，需要用户交互');
                // 显示提示用户点击页面任意位置播放音乐
                const playHint = document.createElement('div');
                playHint.style.position = 'fixed';
                playHint.style.top = '50%';
                playHint.style.left = '50%';
                playHint.style.transform = 'translate(-50%, -50%)';
                playHint.style.background = 'rgba(0,0,0,0.8)';
                playHint.style.color = 'white';
                playHint.style.padding = '20px';
                playHint.style.borderRadius = '10px';
                playHint.style.zIndex = '3000';
                playHint.textContent = '点击任意位置开始播放背景音乐';
                document.body.appendChild(playHint);
                document.body.addEventListener('click', function playMusic() {
                    backgroundMusic.play();
                    musicControl.textContent = '⏸';
                    isPlaying = true;
                    playHint.remove();
                    document.body.removeEventListener('click', playMusic);
                }, { once: true });
            });
            musicControl.textContent = '⏸';
            isPlaying = true;
        }
    });
}

// 创建时光轴项目 (修改以支持懒加载占位符和多张图片)
function createTimelineItem(milestone, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    let mediaHtml = '';

    // 处理多张图片
    if (milestone.image && Array.isArray(milestone.image) && milestone.image.length > 0) {
        // 为每张图片创建懒加载占位符
        mediaHtml = milestone.image.map(image => `
            <div class="media-container">
                <!-- 使用 data-src 存储真实图片地址 -->
                <img class="timeline-image lazy-media" data-src="static/images/${image}" alt="${milestone.title}">
                <!-- 占位符/加载指示器 -->
                <div class="media-placeholder">加载中...</div>
            </div>
        `).join('\n');
    } 
    // 处理单张图片（向后兼容）
    else if (milestone.image) {
        // 为图片创建懒加载占位符
        mediaHtml = `
        <div class="media-container">
            <!-- 使用 data-src 存储真实图片地址 -->
            <img class="timeline-image lazy-media" data-src="static/images/${milestone.image}" alt="${milestone.title}">
            <!-- 占位符/加载指示器 -->
            <div class="media-placeholder">加载中...</div>
        </div>`;
    } 
    // 处理视频
    else if (milestone.video) {
        // 为视频创建懒加载占位符
        mediaHtml = `
        <div class="media-container">
            <!-- 使用 data-src 存储真实视频地址 -->
            <video class="timeline-video lazy-media" data-src="static/video/${milestone.video}" muted preload="none" playsinline>
                <source src="" type="video/mp4"> <!-- src 留空，稍后填充 -->
                您的浏览器不支持视频播放
            </video>
            <div class="video-overlay"></div>
            <!-- 占位符/加载指示器 -->
            <div class="media-placeholder">加载中...</div>
            <button class="play-button" aria-label="播放视频">▶</button>
        </div>`;
    }

    item.innerHTML = `
        <div class="timeline-marker"></div>
        <div class="timeline-content">
            <div class="timeline-date">${milestone.date}</div>
            <div class="timeline-title">${milestone.title}</div>
            <div class="timeline-description">${milestone.description}</div>
            ${mediaHtml}
        </div>
    `;
    return item;
}

// 渲染时光轴
function renderTimeline(config) {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    config.milestones.forEach((milestone, index) => {
        const item = createTimelineItem(milestone, index);
        timeline.appendChild(item);
    });
    // 渲染完成后，初始化懒加载观察器
    initLazyLoading();
}

// --- 新增的懒加载功能 ---

// 初始化 Intersection Observer
function initLazyLoading() {
    // 如果已经存在观察器，先断开连接
    if (mediaObserver) {
        mediaObserver.disconnect();
    }

    // 创建 Intersection Observer 实例
    mediaObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // 当目标元素进入视口时
            if (entry.isIntersecting) {
                const mediaElement = entry.target;
                loadMedia(mediaElement);
                // 加载后停止观察此元素
                observer.unobserve(mediaElement);
            }
        });
    }, {
        // 配置观察器
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.01 // 只要有一小部分进入视口就触发
    });

    // 开始观察所有带有 lazy-media 类的元素
    const lazyMediaElements = document.querySelectorAll('.lazy-media');
    lazyMediaElements.forEach(element => {
        mediaObserver.observe(element);
    });
}

// 加载单个媒体元素（图片或视频）
function loadMedia(mediaElement) {
    const mediaContainer = mediaElement.closest('.media-container');
    const placeholder = mediaContainer.querySelector('.media-placeholder');
    const isImage = mediaElement.classList.contains('timeline-image');
    const isVideo = mediaElement.classList.contains('timeline-video');
    const src = mediaElement.dataset.src; // 从 data-src 获取真实地址

    if (!src) {
        console.error('媒体元素缺少 data-src 属性:', mediaElement);
        // 隐藏整个媒体容器
        if (mediaContainer) mediaContainer.style.display = 'none';
        return;
    }

    if (isImage) {
        // 处理图片加载
        const img = new Image();
        img.onload = function () {
            mediaElement.src = src; // 设置真实 src
            mediaElement.style.display = 'block'; // 显示图片
            if (placeholder) placeholder.remove(); // 移除占位符
        };
        img.onerror = function () {
            console.error('图片加载失败:', src);
            // 隐藏整个媒体容器
            if (mediaContainer) mediaContainer.style.display = 'none';
        };
        // 开始加载
        img.src = src;

    } else if (isVideo) {
        // 处理视频加载
        const sourceElement = mediaElement.querySelector('source');
        if (sourceElement) {
            sourceElement.src = src; // 设置真实的视频源

            // 监听元数据加载完成事件，表示可以播放了
            mediaElement.addEventListener('loadedmetadata', () => {
                if (placeholder) placeholder.remove(); // 移除占位符
                mediaElement.style.display = 'block'; // 显示视频
            }, { once: true }); // 只执行一次

            mediaElement.addEventListener('error', (e) => {
                console.error('视频加载失败:', src, e);
                // 隐藏整个媒体容器
                if (mediaContainer) mediaContainer.style.display = 'none';
            }, { once: true });

            // 重新加载视频源
            mediaElement.load();
        } else {
            console.error('视频元素缺少 source 子元素:', mediaElement);
            // 隐藏整个媒体容器
            if (mediaContainer) mediaContainer.style.display = 'none';
        }
    }
}

// 初始化主内容
function initMainContent() {
    const config = appConfig || defaultConfig;
    // 初始化在一起时间显示
    updateTogetherTime(config.togetherDate);
    // 每秒更新一次时间
    setInterval(() => {
        updateTogetherTime(config.togetherDate);
    }, 1000);
    // 渲染时光轴
    renderTimeline(config);
    // 启动飘落爱心动画
    startFallingHearts();
    // 设置图片/视频放大功能
    setupMediaModal();
    // 设置音乐控制
    setupMusicControl();
    // 初始化Live2D
    initLive2D();
}

// 页面加载完成后初始化验证界面
document.addEventListener('DOMContentLoaded', function () {
    initOTPVerification();
});