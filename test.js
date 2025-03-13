let faceMesh, handPose, video, handDetections = [];
let faceDetections = [];
let options = { maxFaces: 2, refineLandmarks: false, maxHands: 1, flipped: true };
let img;
let canvasSize = [1170 * 2, 854]; 
let zoomFactor = 1; 
let isZoomMode = false;
let isEKeyPressed = false; 
let isVKeyPressed = false; 
let viewImageMode = false; 
let isPKeyPressed = false; 
let findPersonMode = false;
let isFKeyPressed = false;
let findFaceMode = false;

function preload() {
    img = loadImage("img.jpg");
    handPose = ml5.handPose(options);
    faceMesh = ml5.faceMesh(options);
    bodyPose=ml5.bodyPose(options);
}

function setup() {
    createCanvas(...canvasSize);
    video = createCapture(VIDEO, { flipped: true });
    video.size(canvasSize[0] / 2, canvasSize[1]);
    video.hide();
    handPose.detectStart(video, gotHandResults);
    faceMesh.detectStart(img, gotFaceResults);
    bodyPose.detectStart(img, gotBodyResults);
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);
}

function gotHandResults(results) {
    if (results.length > 0) {
        handDetections = results;
    }
}

function gotFaceResults(results) {
    if (results.length > 0) {
        faceDetections = results;
    }
}

function gotBodyResults(results) {
    if (results.length > 0) {
        bodyDetections = results;
    }
}

function draw() {
    if (viewImageMode) {
        drawViewImageMode();
    } else if (isZoomMode) {
        drawZoomedImage();
    } else if (findPersonMode) {
       drawFindPersonMode();
    
    }else if (findFaceMode) {
        drawFindFaceMode();
     
     }
     else {
        image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
        image(img, canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
        if (handDetections.length > 0) {
            let hand = handDetections[0];
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
    circle(indexX, indexY, 20);
    circle(indexX + canvasSize[0] / 2, indexY, 20);
}

function drawThumbFingerTip(hand) {
    let thumbTip = hand.thumb_tip;
    let thumbX = thumbTip.x;
    let thumbY = thumbTip.y;
    thumbX = constrain(thumbX, 0, video.width);
    thumbY = constrain(thumbY, 0, video.height);
    fill(255, 0, 0);
    noStroke();
    circle(thumbX, thumbY, 20);
    circle(thumbX + canvasSize[0] / 2, thumbY, 20);
}


function handleKeyPress(event) {
    if (event.key === 'z') {
        isZKeyPressed = true;
    } else if (event.key === 'e') {
        isEKeyPressed = true;
    } else if (event.key === 'v') {
        isVKeyPressed = true;
    } else if (event.key === 'p') {
        isPKeyPressed = true;
    }else if (event.key === 'f') {
        isFKeyPressed = true;
    }
}

function handleKeyRelease(event) {
    if (event.key === 'z') {
        if (isZKeyPressed) {
            isZoomMode = !isZoomMode;
            isZKeyPressed = false;
        }
    } else if (event.key === 'e') {
        if (isEKeyPressed) {
            isZoomMode = false;
            viewImageMode = false;
            isEKeyPressed = false;
            findPersonMode = false;
            findFaceMode = false;
        }
    } else if (event.key === 'v') {
        if (isVKeyPressed) {
            viewImageMode = !viewImageMode;
            isVKeyPressed = false;
        }
    } else if (event.key === 'p') {
        if (isPKeyPressed) {
            findPersonMode = !findPersonMode;
            isPKeyPressed = false;
        }
    }else if (event.key === 'f') {
        if (isFKeyPressed) {
            findFaceMode = !findFaceMode;
            isFKeyPressed = false;
        }
    } 
}

function drawFindPersonMode() { 
    image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
    image(img, canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
    
    if (bodyDetections && bodyDetections.length > 0) {
    drawBox(bodyDetections, canvasSize[0] / 2); 
    }
    if (handDetections.length > 0 && bodyDetections.length > 0) {
        
        let hand = handDetections[0];
        drawIndexFingerTip(hand);
        let indexFingerTip = hand.index_finger_tip;
        let indexX = indexFingerTip.x 
        let indexY = indexFingerTip.y;

        for (let i = 0; i < bodyDetections.length; i++) {
            console.log("1");
            let box = bodyDetections[i].box;
            console.log(indexX,box.xMin);
            console.log(indexY , box.yMin);
            if (indexX > box.xMin && indexX < box.xMax && indexY > box.yMin && indexY < box.yMax) {
                scaleFace(img, box, canvasSize);
                break;
            }
        }
    }
}

function drawFindFaceMode() { 
    image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
    image(img, canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
    
    if (faceDetections && faceDetections.length > 0) {
        drawBox(faceDetections, canvasSize[0] / 2); 
    }
    if (handDetections.length > 0 && faceDetections.length > 0) {
        
        let hand = handDetections[0];
        drawIndexFingerTip(hand);
        let indexFingerTip = hand.index_finger_tip;
        let indexX = indexFingerTip.x 
        let indexY = indexFingerTip.y;

        for (let i = 0; i < faceDetections.length; i++) {
            let box = faceDetections[i].box;
            console.log(indexX,box.xMin);
            console.log(indexY , box.yMin);
            if (indexX > box.xMin && indexX < box.xMax && indexY > box.yMin && indexY < box.yMax) {
                scaleFace(img, box, canvasSize);
                break;
            }
        }
    }
}

function scaleFace(img, box, canvasSize) {
    let scale = 1.5;
    let newWidth = box.width * scale;
    let newHeight = box.height * scale;
    let newX = box.xMin + (box.width - newWidth) / 2;
    let newY = box.yMin + (box.height - newHeight) / 2;
    let croppedImg = img.get(box.xMin, box.yMin, box.width, box.height);
    image(croppedImg, newX + canvasSize[0] / 2, newY, newWidth, newHeight);
}

function drawBox(detections, imgXOffset){
    noFill();
    stroke(0,255,0);
    strokeWeight(2);
    for(let i=0; i<detections.length; i++){
        let box = detections[i].box;
        rect(imgXOffset + box.xMin, box.yMin, box.width, box.height);
    }
}

function drawZoomedImage() {
    image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
    image(img, canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);

    if (handDetections.length > 0) {
        let hand = handDetections[0];
        drawIndexFingerTip(hand);
        drawThumbFingerTip(hand);

        let thumbTip = hand.thumb_tip;
        let indexFingerTip = hand.index_finger_tip;
        let midX = (thumbTip.x + indexFingerTip.x) / 2;
        let midY = (thumbTip.y + indexFingerTip.y) / 2;

        
        calculateZoomFactor(hand);

        let zoomRectWidth = img.width * zoomFactor;
        let zoomRectHeight = img.height * zoomFactor;
        let x = midX - zoomRectWidth / 2;
        let y = midY - zoomRectHeight / 2;

        x = constrain(x, 0, img.width - zoomRectWidth);
        y = constrain(y, 0, img.height - zoomRectHeight);

        let zoomedImage = img.get(x, y, zoomRectWidth, zoomRectHeight);
        image(zoomedImage,canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
    }
}

function calculateZoomFactor(hand) {
    let indexFingerTip = hand.index_finger_tip;
    let thumbTip = hand.thumb_tip;
    let distance = dist(indexFingerTip.x, indexFingerTip.y, thumbTip.x, thumbTip.y);
    zoomFactor = map(distance, 0, video.width, 1, 0.1); 
}

function drawViewImageMode() {
   
    image(img, -canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
    filter(BLUR, 3);
    image(video, 0, 0, canvasSize[0] / 2, canvasSize[1]);
   
    if (handDetections.length > 0) {
        let hand = handDetections[0];
        let indexFingerTip = hand.index_finger_tip;
        drawIndexFingerTip(hand);
        if (indexFingerTip) {
            let indexX = indexFingerTip.x;
            let indexY = indexFingerTip.y;

            indexX = constrain(indexX, 0, video.width);
            indexY = constrain(indexY, 0, video.height);

            let rectWidth = 300;
            let rectHeight = 300;
            let x = indexX - rectWidth / 2;
            let y = indexY - rectHeight / 2;

            x = constrain(x, 0, img.width - rectWidth);
            y = constrain(y, 0, img.height - rectHeight);

            let region = img.get(x, y, rectWidth, rectHeight);

            let centerX = indexX - rectWidth / 2 + canvasSize[0] / 2; 
            let centerY = indexY - rectHeight / 2;

            image(region, centerX, centerY, rectWidth, rectHeight);
            image(img, -canvasSize[0] / 2, 0, canvasSize[0] / 2, canvasSize[1]);
            
        }
    }
    
}