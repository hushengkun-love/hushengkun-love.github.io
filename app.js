// 百度AI配置（需替换为你的API Key）
const API_KEY = 'Je6Bd7KUPGkRDqImSiFYy6LQ';
const SECRET_KEY = 'dP8a4awbUDPPBhcQGsHfpAjZab1EmMSW';

document.getElementById('uploadInput').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // 转Base64
    const base64 = await convertToBase64(file);
  
    // 获取颜值评分
    try {
        const score = await getFaceScore(base64);
        displayResult(score);
    } catch (error) {
        alert('分析失败: ' + error.message);
    }
});

// 图片转Base64
function convertToBase64(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.readAsDataURL(file);
    });
}

// 调用百度API
async function getFaceScore(base64Data) {
    // 获取Access Token
    const token = await fetch(`https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`)
        .then(res => res.json())
        .then(data => data.access_token);

    // 发送人脸检测请求
    const response = await fetch(`https://aip.baidubce.com/rest/2.0/face/v3/detect?access_token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: base64Data,
            image_type: "BASE64",
            face_field: "beauty,gender,age"
        })
    });

    const data = await response.json();
    if (data.error_code) {
        throw new Error(data.error_msg);
    }
    return data.result.face_list[0].beauty;
}

// 显示结果
function displayResult(score) {
    const scoreElement = document.getElementById('score');
    const commentElement = document.getElementById('comment');
  
    scoreElement.textContent = score.toFixed(1);
  
    // 生成评语
    const comments = [
        `综合评分${score.toFixed(1)}！三庭五眼比例完美，符合传统美学标准`,
        `面相得分${score.toFixed(1)}，天庭饱满地阁方圆，主富贵之相`,
        `检测到颜值分数${score.toFixed(1)}，眉目如画气质出众`
    ];
    commentElement.textContent = comments[Math.floor(Math.random() * comments.length)];
  
    // 10秒后清空结果
    setTimeout(() => {
        document.getElementById('uploadInput').value = '';
        scoreElement.textContent = '0.0';
        commentElement.textContent = '等待分析中...';
    }, 10000);
}