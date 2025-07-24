// 全局变量存储配置
let appConfig = null;

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
document.getElementById('verifyButton').addEventListener('click', function() {
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
                setTimeout(function() {
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
                    setTimeout(function() {
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
document.getElementById('otpInput').addEventListener('keypress', function(e) {
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

// 创建飘动的爱心
function createFloatingHearts() {
    const heartCount = 20;
    const container = document.body;
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.innerHTML = '❤';
            // 随机位置
            const startX = Math.random() * window.innerWidth;
            heart.style.left = `${startX}px`;
            heart.style.animationDelay = `${Math.random() * 5}s`;
            container.appendChild(heart);
            // 动画结束后移除
            setTimeout(() => {
                heart.remove();
            }, 6000);
        }, i * 300);
    }
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

    // 点击图片放大
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('timeline-image')) {
            modal.style.display = 'block';
            modalImg.src = e.target.src;
            modalImg.style.display = 'block';
            modalVideo.style.display = 'none';
            document.body.style.overflow = 'hidden';
        } else if (e.target.classList.contains('timeline-video')) {
            modal.style.display = 'block';
            modalVideo.src = e.target.querySelector('source').src; // 获取source标签的src属性
            modalVideo.style.display = 'block';
            modalImg.style.display = 'none';

            // 尝试播放视频
            const playPromise = modalVideo.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("视频播放失败:", error);
                    // 显示错误信息
                    const errorDiv = document.createElement('div');
                    errorDiv.textContent = '视频播放失败，请检查文件路径或格式';
                    errorDiv.style.color = 'red';
                    errorDiv.style.textAlign = 'center';
                    errorDiv.style.padding = '10px';
                    modalVideo.parentNode.insertBefore(errorDiv, modalVideo.nextSibling);
                });
            }

            document.body.style.overflow = 'hidden';
        } else if (e.target.classList.contains('play-button')) {
            const video = e.target.previousElementSibling;
            const source = video.querySelector('source');
            if (source) {
                modal.style.display = 'block';
                modalVideo.src = source.src;
                modalVideo.style.display = 'block';
                modalImg.style.display = 'none';

                // 尝试播放视频
                const playPromise = modalVideo.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error("视频播放失败:", error);
                        // 显示错误信息
                        const errorDiv = document.createElement('div');
                        errorDiv.textContent = '视频播放失败，请检查文件路径或格式';
                        errorDiv.style.color = 'red';
                        errorDiv.style.textAlign = 'center';
                        errorDiv.style.padding = '10px';
                        modalVideo.parentNode.insertBefore(errorDiv, modalVideo.nextSibling);
                    });
                }

                document.body.style.overflow = 'hidden';
            }
        }
    });

    // 关闭模态框
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        modalVideo.pause();
        // 移除可能存在的错误信息
        const errorDiv = modalVideo.parentNode.querySelector('div[style*="color: red"]');
        if (errorDiv) errorDiv.remove();
        document.body.style.overflow = 'auto';
    };

    // 点击模态框背景关闭
    modal.onclick = function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            modalVideo.pause();
            // 移除可能存在的错误信息
            const errorDiv = modalVideo.parentNode.querySelector('div[style*="color: red"]');
            if (errorDiv) errorDiv.remove();
            document.body.style.overflow = 'auto';
        }
    };

    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            modalVideo.pause();
            // 移除可能存在的错误信息
            const errorDiv = modalVideo.parentNode.querySelector('div[style*="color: red"]');
            if (errorDiv) errorDiv.remove();
            document.body.style.overflow = 'auto';
        }
    });
}

// 音乐控制
function setupMusicControl() {
    const musicControl = document.getElementById('musicControl');
    const backgroundMusic = document.getElementById('backgroundMusic');
    let isPlaying = false;
    musicControl.addEventListener('click', function() {
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

// 创建时光轴项目
function createTimelineItem(milestone, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    let mediaHtml = '';

    if (milestone.image) {
        mediaHtml = `<div class="media-container">
            <img src="static/images/${milestone.image}" alt="${milestone.title}" class="timeline-image" onerror="this.style.display='none'">
        </div>`;
    } else if (milestone.video) {
        // 支持多种视频格式
        const videoName = milestone.video; // 获取文件名（不含扩展名）
        mediaHtml = `<div class="media-container">
            <video class="timeline-video" muted preload="metadata">
                <source src="static/video/${videoName}" type="video/mp4">
                您的浏览器不支持视频播放
            </video>
            <div class="video-overlay"></div>
            <button class="play-button">▶</button>
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
    // 创建飘动的爱心
    createFloatingHearts();
    setInterval(createFloatingHearts, 10000);
    // 设置媒体放大功能
    setupMediaModal();
    // 设置音乐控制
    setupMusicControl();
    // 初始化Live2D
    initLive2D();
}

// 页面加载完成后初始化验证界面
document.addEventListener('DOMContentLoaded', function() {
    initOTPVerification();
});