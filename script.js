const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let score = 0;
let previousScore = 0;
const scoreElement = document.getElementById('score');

function updateScore() {
    scoreElement.textContent = `Score: ${score}`;
}

const CELL_WIDTH = 16;
const CELL_HEIGHT = 16;
const GRID_COLUMNS = Math.floor(window.innerWidth / CELL_WIDTH);
const GRID_ROWS = Math.floor((window.innerHeight - 100) / CELL_HEIGHT);

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const SCALE = 2;
const SCALED_WIDTH = FRAME_WIDTH * SCALE;
const SCALED_HEIGHT = FRAME_HEIGHT * SCALE;
const SHEET_WIDTH = 100;
const SHEET_HEIGHT = 133;
const COLUMNS = 3;
const ROWS = 4;
const H_PADDING = 1;
const V_PADDING = 3;

const keyMap = {
    'W': 1,
    'S': 0,
    'A': 2,
    'D': 3
};

let spriteX = Math.floor(GRID_COLUMNS / 2) * CELL_WIDTH + (CELL_WIDTH - SCALED_WIDTH) / 2;
let spriteY = Math.floor(GRID_ROWS / 2) * CELL_HEIGHT + (CELL_HEIGHT - SCALED_HEIGHT) / 2;
let currentRow = 0;
let currentFrame = 0;

const framesPerRow = COLUMNS;
let direction = null;
let moving = false;

const spriteSheet = new Image();
spriteSheet.src = 'player.png';

const itemsSpriteSheet = new Image();
itemsSpriteSheet.src = 'items.png';

const obstaclesSpriteSheet = new Image();
obstaclesSpriteSheet.src = 'obstacles.png';

let moveDelay = 9;
let moveCounter = 0;

const items = [];
const ITEM_SIZE = 16;
const ITEM_SCALE = 2;
const SCALED_ITEM_SIZE = ITEM_SIZE * ITEM_SCALE;

const obstacles = [];
const OBSTACLE_SIZE = 32;
const SCALED_OBSTACLE_SIZE = OBSTACLE_SIZE * SCALE;

const itemScores = [15, 20, 5, 10, 20, 50, 500, 30, 35, 20, 250, 100];
let obstacleCounter = 0;

function placeItem() {
    const itemType = Math.floor(Math.random() * itemScores.length);
    const itemX = Math.floor(Math.random() * (GRID_COLUMNS - 3)) * CELL_WIDTH + (CELL_WIDTH - SCALED_ITEM_SIZE) / 2 + CELL_WIDTH;
    const itemY = Math.floor(Math.random() * (GRID_ROWS - 3)) * CELL_HEIGHT + (CELL_HEIGHT - SCALED_ITEM_SIZE) / 2 + CELL_HEIGHT;
    items.push({ x: itemX, y: itemY, type: itemType });
}

function placeObstacle() {
    const obstacleX = Math.floor(Math.random() * (GRID_COLUMNS - 1)) * CELL_WIDTH + (CELL_WIDTH - SCALED_OBSTACLE_SIZE) / 2 + CELL_WIDTH;
    const obstacleY = Math.floor(Math.random() * (GRID_ROWS - 1)) * CELL_HEIGHT + (CELL_HEIGHT - SCALED_OBSTACLE_SIZE) / 2 + CELL_HEIGHT;
    const frameIndex = Math.floor(Math.random() * 12);
    obstacles.push({ x: obstacleX, y: obstacleY, frame: frameIndex });
}

function updateSprite() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    items.forEach(item => {
        const itemSourceX = item.type * ITEM_SIZE;
        ctx.drawImage(itemsSpriteSheet, itemSourceX, 0, ITEM_SIZE, ITEM_SIZE, item.x, item.y, SCALED_ITEM_SIZE, SCALED_ITEM_SIZE);
    });
    obstacles.forEach(obstacle => {
        const frameX = (obstacle.frame % 2) * OBSTACLE_SIZE;
        const frameY = Math.floor(obstacle.frame / 6) * OBSTACLE_SIZE;
        ctx.drawImage(obstaclesSpriteSheet, frameX, frameY, OBSTACLE_SIZE, OBSTACLE_SIZE, obstacle.x, obstacle.y, SCALED_OBSTACLE_SIZE, SCALED_OBSTACLE_SIZE);
    });
    const sourceX = currentFrame * (FRAME_WIDTH + H_PADDING);
    const sourceY = currentRow * (FRAME_HEIGHT + V_PADDING);
    ctx.drawImage(spriteSheet, sourceX, sourceY, FRAME_WIDTH, FRAME_HEIGHT, spriteX, spriteY, SCALED_WIDTH, SCALED_HEIGHT);
}

function moveSprite(event) {
    const key = event.key.toUpperCase();
    if (keyMap.hasOwnProperty(key)) {
        direction = key;
        currentRow = keyMap[key];
        moving = true;
    } else {
        return;
    }
}

function resetSprite() {
    spriteX = Math.floor(GRID_COLUMNS / 2) * CELL_WIDTH + (CELL_WIDTH - SCALED_WIDTH) / 2;
    spriteY = Math.floor(GRID_ROWS / 2) * CELL_HEIGHT + (CELL_HEIGHT - SCALED_HEIGHT) / 2;
    currentFrame = 0;
    moving = false;
    direction = null;
    alert('It Looks like your Journey ends here trainer, Better Luck Next Time\nYour Score is: ' + score);
    score = 0;
    previousScore = 0;
    moveDelay = 12;
    updateScore();
    items.length = 0;
    obstacles.length = 0;
    obstacleCounter = 0;
    placeItem();
    placeObstacle();
    updateSprite();
}

function checkItemCollection() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const distanceX = Math.abs(spriteX - item.x);
        const distanceY = Math.abs(spriteY - item.y);
        if (distanceX < SCALED_ITEM_SIZE && distanceY < SCALED_ITEM_SIZE) {
            items.splice(i, 1);
            score += itemScores[item.type];
            updateScore();
            placeItem();
            if (Math.floor(score / 500) > Math.floor(previousScore / 500) && obstacleCounter < 20) {
                placeObstacle();
                obstacleCounter++;
                moveDelay = Math.max(3, moveDelay - 1);
            }
            previousScore = score;
        }
    }
}

function checkObstacleCollision() {
    for (const obstacle of obstacles) {
        const distanceX = Math.abs(spriteX - obstacle.x);
        const distanceY = Math.abs(spriteY - obstacle.y);
        if (distanceX < SCALED_OBSTACLE_SIZE && distanceY < SCALED_OBSTACLE_SIZE) {
            resetSprite();
            break;
        }
    }
}

function moveInDirection() {
    if (!moving) return;
    moveCounter++;
    if (moveCounter < moveDelay) return;
    moveCounter = 0;
    if (direction === 'W') {
        spriteY -= CELL_HEIGHT;
    } else if (direction === 'S') {
        spriteY += CELL_HEIGHT;
    } else if (direction === 'A') {
        spriteX -= CELL_WIDTH;
    } else if (direction === 'D') {
        spriteX += CELL_WIDTH;
    }
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const playerRightEdge = spriteX + SCALED_WIDTH;
    const playerBottomEdge = spriteY + SCALED_HEIGHT;
    if (spriteX < 0 || playerRightEdge > canvasWidth || spriteY < 0 || playerBottomEdge > canvasHeight) {
        resetSprite();
    }
    checkItemCollection();
    checkObstacleCollision();
    currentFrame = (currentFrame + 1) % framesPerRow;
    updateSprite();
}

window.addEventListener('keydown', moveSprite);
window.requestAnimationFrame(function gameLoop() {
    moveInDirection();
    window.requestAnimationFrame(gameLoop);
});

placeItem();
placeObstacle();