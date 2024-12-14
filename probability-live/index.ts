function getCanvasDimension(c: Readonly<HTMLCanvasElement>): { width: number, height: number } {
    const { width, height } = c.getBoundingClientRect();
    return { width, height };
}

interface Pos2D {
    x: number,
    y: number,
}

interface Line2D {
    from: Pos2D,
    to: Pos2D
}

interface ShootingStar {
    pos: Pos2D,
    maxLength: number,
    currentLength: number,
}

function getRandomInt(min: number, max: number): number {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}

function generatePoisson(lambda: number): number {
    let occurrences = -1, ss = 0;

    while (ss <= lambda) {
        occurrences += 1;
        ss -= Math.log(1 - Math.random())
    }

    return occurrences
}


const titleSky = document.getElementById("title-sky") as HTMLCanvasElement;
const titleSkySmall = document.createElement('canvas') as HTMLCanvasElement;
const titleSkyCtx = titleSky.getContext('2d')!;
const titleSkySmallCtx = titleSkySmall.getContext('2d')!;


// Define dimensions
const pixelWidth = 256;  // Low resolution width
const pixelHeight = 256; // Low resolution height


let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
let scale = 2;       // Scale factor (pixel size)
if (vw < 512) {
    scale = 1;
}

const lambda = 0.05; // unit is per frame
const starPNG = new Image()
starPNG.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAcUlEQVQ4T9VSSQ7AIAgU///mWhigsSg2MelBEk/CbEBlXc2+KWtLP2zgcIDGBSdEcDq1u8pgGwC0zu7pm4pBiSjwpNEbB+P6FKjyu9TeF4Cgw6f081yn5AGIJLkFpXvl9kuIrmh7C72lw08ZZ2F+0rBv0UYsDzyQ6qkAAAAASUVORK5CYIIA'
let starsPos: Pos2D[] = [];
starsPos.push({ x: getRandomInt(16, 80), y: getRandomInt(16, 80) })
starsPos.push({ x: getRandomInt(130, 180), y: getRandomInt(16, 80) })
starsPos.push({ x: getRandomInt(130, 180), y: getRandomInt(130, 180) })

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
titleSkySmallCtx.font = "12px DotGothic16";

function drawLines(ctx: CanvasRenderingContext2D, lines: Readonly<Line2D>[]) {
    ctx.beginPath();

    for (const line of lines) {
        if (line.from.x != line.to.x && line.from.y != line.to.y) {
            ctx.moveTo(line.from.x, line.from.y);
            ctx.lineTo(line.to.x, line.to.y);
        }
    }

    ctx.stroke();
}

let shootingStars: ShootingStar[] = []

function shootingStarToLines(shootingStars: Readonly<ShootingStar>[]): Line2D[] {
    let lines: Line2D[] = [];

    for (const shootingStar of shootingStars) {
        if (shootingStar.currentLength < shootingStar.maxLength) {
            lines.push({ from: shootingStar.pos, to: { x: shootingStar.pos.x - shootingStar.currentLength, y: shootingStar.pos.y + shootingStar.currentLength } })
        } else {
            const shrunkInLength = shootingStar.currentLength - shootingStar.maxLength;
            lines.push({ from: { x: shootingStar.pos.x - shrunkInLength, y: shootingStar.pos.y + shrunkInLength }, to: { x: shootingStar.pos.x - shootingStar.maxLength, y: shootingStar.pos.y + shootingStar.maxLength } })
        }
    }

    return lines;
}

function updateShootingStars(shootingStars: Readonly<ShootingStar>[]): ShootingStar[] {
    const newState: ShootingStar[] = [];

    // Evolve current shooting stars
    for (const shootingStar of shootingStars) {
        if (shootingStar.currentLength < shootingStar.maxLength * 2) {
            newState.push({ ...shootingStar, currentLength: shootingStar.currentLength + 1 })
        }
    }

    // Add new shooting stars
    // We take a uniform random x, y starting point within canvas coordinates
    // We take a uniform random length from 5 to 20
    // Shooting stars occur at a default rate of 0.002 per frame

    const occurrences = generatePoisson(lambda);
    for (let i = 0; i < occurrences; i++) {
        const newShootingStar = {
            pos: { x: getRandomInt(10, pixelWidth), y: getRandomInt(10, pixelHeight - 80) },
            maxLength: getRandomInt(10, 20),
            currentLength: 0
        }

        // console.log(newShootingStar);
        newState.push(newShootingStar);

        // console.log(JSON.stringify(newShootingStar.pos));
    }

    return newState;
}

function drawStars(ctx: CanvasRenderingContext2D, starsPos: Readonly<Pos2D>[]) {
    for (const starPos of starsPos) {
        ctx.drawImage(starPNG, starPos.x, starPos.y);
    }
}

function getTime(frameCount: number): string {
    let d = new Date("2024-01-01T21:00:00.000");

    d.setSeconds(d.getSeconds() + frameCount)

    return d.toLocaleString('en-GB', { hour: 'numeric', minute: 'numeric', hour12: true });
}

function drawTime(ctx: CanvasRenderingContext2D, frameCount: number) {
    const time_str = getTime(frameCount);

    ctx.beginPath();
    ctx.rect(titleSkySmallDims.width - 63, titleSkySmallDims.height - 26, 57, 20);
    ctx.stroke();

    ctx.fillText(time_str, titleSkySmallDims.width - 60, titleSkySmallDims.height - 12);
}


function drawPixelArt(frameCount: number) {
    titleSkySmallCtx.clearRect(0, 0, titleSkySmallDims.width, titleSkySmallDims.height);

    titleSkySmallCtx.fillStyle = 'black';
    const shootingStarsRendered = shootingStarToLines(shootingStars);

    drawLines(titleSkySmallCtx, shootingStarsRendered);
    drawStars(titleSkySmallCtx, starsPos);

    drawTime(titleSkySmallCtx, frameCount);
}

function renderPixelArt() {
    titleSkyCtx.clearRect(0, 0, titleSkyDims.width, titleSkyDims.height);
    titleSkyCtx.drawImage(
        titleSkySmall,
        0,
        0,
        titleSkySmallDims.width,
        titleSkySmallDims.height,
        0,
        0,
        titleSkyDims.width,
        titleSkyDims.height
    );
}

let frameCount = 0;
let FRAME_COUNT_MAX = 3600 * 10;

function animate() {
    drawPixelArt(frameCount);
    renderPixelArt();

    shootingStars = updateShootingStars(shootingStars);

    requestAnimationFrame(animate);

    frameCount += 1;

    if (frameCount >= FRAME_COUNT_MAX) frameCount = 0;
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