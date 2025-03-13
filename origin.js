let handPose, video, detections = [];
let options = { maxHands: 1, flipped: true };
let img;
let canvasSize = [1170 * 2, 854]; // 宽度2048，高度683
let zoomFactor = 1; // 初始化放大倍数为1
let isZoomMode = false; // 标记是否处于放大模式
let isEKeyPressed = false; // 标记 'e' 键是否被按下
let isVKeyPressed = false; // 标记 'v' 键是否被按下
let viewImageMode = false; // 标记是否处于查看图像模式
let margin = 150;
let yOffset = 50;
let xOffsetImg = 150;

function preload() {
    handPose = ml5.handPose(options);
    img = loadImage("img.jpg");
}

function setup() {
    createCanvas(...canvasSize);
    video = createCapture(VIDEO, { flipped: true });
    video.size(canvasSize[0] / 2, canvasSize[1]);
    video.hide();
    handPose.detectStart(video, gotResults);
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);
}

function gotResults(results) {
    detections = results;
}

function draw() {
    if (viewImageMode) {
        drawViewImageMode();
    } else if (isZoomMode) {
        drawZoomedImage();
        if (detections.length > 0) {
            let hand = detections[0];
            drawIndexFingerTip(hand);
            drawThumbFingerTip(hand);
        }
    } else {
        image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
        image(img, canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
        if (detections.length > 0) {
            let hand = detections[0];
            drawIndexFingerTip(hand);
        }
    }
}

function drawIndexFingerTip(hand) {
    let indexFingerTip = hand.index_finger_tip;
    let indexX = indexFingerTip.x;
    let indexY = indexFingerTip.y;
    indexX = constrain(indexX, 0, video.width);
    indexY = constrain(indexY, 0, video.height);
    fill(255, 0, 0);
    noStroke();
    circle(indexX, indexY, 10);
    circle(indexX + canvasSize[0] / 2, indexY, 10);
}

function drawThumbFingerTip(hand) {
    let thumbTip = hand.thumb_tip;
    let thumbX = thumbTip.x;
    let thumbY = thumbTip.y;
    thumbX = constrain(thumbX, 0, video.width);
    thumbY = constrain(thumbY, 0, video.height);
    fill(255, 0, 0);
    noStroke();
    circle(thumbX, thumbY, 10);
    circle(thumbX + canvasSize[0] / 2, thumbY, 10);
}

function calculateZoomFactor(hand) {
    let indexFingerTip = hand.index_finger_tip;
    let thumbTip = hand.thumb_tip;
    let distance = dist(indexFingerTip.x, indexFingerTip.y, thumbTip.x, thumbTip.y);
    zoomFactor = map(distance, 0, video.width, 1, 4); 
}

function handleKeyPress(event) {
    if (event.key === 'z') {
        isZKeyPressed = true;
    } else if (event.key === 'e') {
        isEKeyPressed = true;
    } else if (event.key === 'v') {
        isVKeyPressed = true;
    }
}

function handleKeyRelease(event) {
    if (event.key === 'z') {
        if (isZKeyPressed) {
            isZoomMode = !isZoomMode; // 切换放大模式状态
            isZKeyPressed = false; // 重置 'z' 键状态
        }
    } else if (event.key === 'e') {
        if (isEKeyPressed) {
            isZoomMode = false; // 退出放大模式，重新显示原始图像
            viewImageMode=false;
            isEKeyPressed = false; // 重置 'e' 键状态
        }
    } else if (event.key === 'v') {
        if (isVKeyPressed) {
            viewImageMode = !viewImageMode; // 切换查看图像模式状态
            isVKeyPressed = false; // 重置 'v' 键状态
        }
    }
}

function drawZoomedImage() {
    if (zoomFactor > 1 && detections.length > 0) {
        let hand = detections[0];
        let indexFingerTip = hand.index_finger_tip;
        let thumbTip = hand.thumb_tip;
        let midX = ((indexFingerTip.x + thumbTip.x) / 2);
        let midY = ((indexFingerTip.y + thumbTip.y) / 2);
        midX = constrain(midX, 0, video.width);
        midY = constrain(midY, 0, video.height);

        let zoomedX = midX - (canvasSize[0] / 4) * (zoomFactor - 1);
        let zoomedY = midY - (canvasSize[1] / 4) * (zoomFactor - 1);
        let zoomedImage = img.get(zoomedX, zoomedY, canvasSize[0] / 2 * zoomFactor, canvasSize[1] * zoomFactor);
        image(zoomedImage, 0, 0, canvasSize[0], canvasSize[1]);
    }
}

function drawViewImageMode() {
   
    image(img, -canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
    filter(BLUR, 3);
    image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
   
    if (detections.length > 0) {
        let hand = detections[0];
        let indexFingerTip = hand.index_finger_tip;

        // 确保indexFingerTip存在
        if (indexFingerTip) {
            let indexX = indexFingerTip.x;
            let indexY = indexFingerTip.y;

            // 确保indexFingerTip的坐标在视频流范围内
            indexX = constrain(indexX, 0, video.width);
            indexY = constrain(indexY, 0, video.height);

            // 绘制食指指尖的位置
            fill(255, 0, 0);
            noStroke();
            circle(indexX, indexY, 10); // 在视频流上绘制食指指尖

            // 计算要获取的区域的坐标和尺寸
            let rectWidth = 300;
            let rectHeight = 300;
            let x = indexX - rectWidth / 2;
            let y = indexY - rectHeight / 2;

            // 确保区域的坐标在图像范围内
            x = constrain(x, 0, img.width - rectWidth);
            y = constrain(y, 0, img.height - rectHeight);

            // 从图像中获取指定区域
            let region = img.get(x, y, rectWidth, rectHeight);

            // 计算区域在画布上的位置，使其以食指指尖为中心
            let centerX = indexX - rectWidth / 2 + canvasSize[0] / 2; // 将x坐标转换到右侧画布
            let centerY = indexY - rectHeight / 2;

            // 在模糊图像上绘制清晰的区域
            image(region, centerX, centerY, rectWidth, rectHeight);
            image(img, -canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
            
        }
    }
    
}