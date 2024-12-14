"use strict";
function getCanvasDimension(c) {
    const { width, height } = c.getBoundingClientRect();
    return { width, height };
}
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
function generatePoisson(lambda) {
    let occurrences = -1, ss = 0;
    while (ss <= lambda) {
        occurrences += 1;
        ss -= Math.log(1 - Math.random());
    }
    return occurrences;
}
const titleSky = document.getElementById("title-sky");
const titleSkySmall = document.createElement('canvas');
const titleSkyCtx = titleSky.getContext('2d');
const titleSkySmallCtx = titleSkySmall.getContext('2d');
// Define dimensions
const pixelWidth = 256; // Low resolution width
const pixelHeight = 256; // Low resolution height
let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
let scale = 2; // Scale factor (pixel size)
if (vw < 512) {
    scale = 1;
}
const lambda = 0.05; // unit is per frame
const starPNG = new Image();
starPNG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4T9VSSQ7AIAgU///mWhigsSg2MelBEk/CbEBlXc2+KWtLP2zgcIDGBSdEcDq1u8pgGwC0zu7pm4pBiSjwpNEbB+P6FKjyu9TeF4Cgw6f081yn5AGIJLkFpXvl9kuIrmh7C72lw08ZZ2F+0rBv0UYsDzyQ6qkAAAAASUVORK5CYIIA';
let starsPos = [];
starsPos.push({ x: getRandomInt(16, 80), y: getRandomInt(16, 80) });
starsPos.push({ x: getRandomInt(130, 230), y: getRandomInt(16, 80) });
starsPos.push({ x: getRandomInt(130, 230), y: getRandomInt(130, 230) });
// Set pixel canvas size
const titleSkySmallDims = { width: pixelWidth, height: pixelHeight };
// Set main canvas size to scaled dimensions
const titleSkyDims = { width: pixelWidth * scale, height: pixelHeight * scale };
titleSky.width = titleSkyDims.width;
titleSky.height = titleSkyDims.height;
titleSkySmall.width = titleSkySmallDims.width;
titleSkySmall.height = titleSkySmallDims.height;
titleSkyCtx.imageSmoothingEnabled = false;
titleSkySmallCtx.imageSmoothingEnabled = false;
function drawLines(ctx, lines) {
    ctx.beginPath();
    for (const line of lines) {
        if (line.from.x != line.to.x && line.from.y != line.to.y) {
            ctx.moveTo(line.from.x, line.from.y);
            ctx.lineTo(line.to.x, line.to.y);
        }
    }
    ctx.stroke();
}
let shootingStars = [];
function shootingStarToLines(shootingStars) {
    let lines = [];
    for (const shootingStar of shootingStars) {
        if (shootingStar.currentLength < shootingStar.maxLength) {
            lines.push({ from: shootingStar.pos, to: { x: shootingStar.pos.x - shootingStar.currentLength, y: shootingStar.pos.y + shootingStar.currentLength } });
        }
        else {
            const shrunkInLength = shootingStar.currentLength - shootingStar.maxLength;
            lines.push({ from: { x: shootingStar.pos.x - shrunkInLength, y: shootingStar.pos.y + shrunkInLength }, to: { x: shootingStar.pos.x - shootingStar.maxLength, y: shootingStar.pos.y + shootingStar.maxLength } });
        }
    }
    return lines;
}
function updateShootingStars(shootingStars) {
    const newState = [];
    // Evolve current shooting stars
    for (const shootingStar of shootingStars) {
        if (shootingStar.currentLength < shootingStar.maxLength * 2) {
            newState.push(Object.assign(Object.assign({}, shootingStar), { currentLength: shootingStar.currentLength + 1 }));
        }
    }
    // Add new shooting stars
    // We take a uniform random x, y starting point within canvas coordinates
    // We take a uniform random length from 5 to 20
    // Shooting stars occur at a default rate of 0.002 per frame
    const occurrences = generatePoisson(lambda);
    for (let i = 0; i < occurrences; i++) {
        const newShootingStar = {
            pos: { x: getRandomInt(10, pixelWidth), y: getRandomInt(10, pixelHeight) },
            maxLength: getRandomInt(10, 20),
            currentLength: 0
        };
        newState.push(newShootingStar);
        // console.log(JSON.stringify(newShootingStar.pos));
    }
    return newState;
}
function drawStars(ctx, starsPos) {
    for (const starPos of starsPos) {
        ctx.drawImage(starPNG, starPos.x, starPos.y);
    }
}
function drawPixelArt() {
    titleSkySmallCtx.clearRect(0, 0, titleSkySmallDims.width, titleSkySmallDims.height);
    titleSkySmallCtx.fillStyle = 'black';
    const shootingStarsRendered = shootingStarToLines(shootingStars);
    drawLines(titleSkySmallCtx, shootingStarsRendered);
    drawStars(titleSkySmallCtx, starsPos);
}
function renderPixelArt() {
    titleSkyCtx.clearRect(0, 0, titleSkyDims.width, titleSkyDims.height);
    titleSkyCtx.drawImage(titleSkySmall, 0, 0, titleSkySmallDims.width, titleSkySmallDims.height, 0, 0, titleSkyDims.width, titleSkyDims.height);
}
var frameCount = 0;
function animate() {
    drawPixelArt();
    renderPixelArt();
    shootingStars = updateShootingStars(shootingStars);
    requestAnimationFrame(animate);
    frameCount += 1;
}
animate();
// let x = 0;
// function animateTitleSky() {
//     window.requestAnimationFrame(animateTitleSky);
//     const ctx = titleSky.getContext('2d');
//     ctx!.fillStyle = 'black';
//     ctx!.fillRect(x, 50, 1, 1);
//     x += 1;
// }
// animateTitleSky();
