const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const WIDTH = 960;
const HEIGHT = 540;
const OUTPUT_DIR = path.resolve(__dirname, '..', 'assets', 'generated-step-images');

const recipes = [
  { id: 910001, colors: ['#D9B35F', '#F2D27A', '#A94F3B'], steps: ['ingredients', 'fry', 'fry', 'mix', 'boil', 'serve'] },
  { id: 910002, colors: ['#E9D2A6', '#C6A26D', '#6F8F4E'], steps: ['ingredients', 'boil', 'fry', 'boil', 'mix', 'serve'] },
  { id: 910003, colors: ['#F1E4C4', '#F48C4E', '#70A95B'], steps: ['ingredients', 'fry', 'fry', 'mix', 'boil', 'serve'] },
  { id: 910004, colors: ['#FFD46B', '#E8573F', '#F4F0C8'], steps: ['mix', 'chop', 'fry', 'fry', 'boil', 'serve'] },
  { id: 910005, colors: ['#D7B07A', '#C2B18A', '#F0DDC0'], steps: ['ingredients', 'fry', 'fry', 'mix', 'boil', 'serve'] },
  { id: 910006, colors: ['#9AC16A', '#D98055', '#E7C27B'], steps: ['chop', 'fry', 'fry', 'mix', 'boil', 'serve'] },
  { id: 910007, colors: ['#E7C56D', '#F2E0A2', '#C6884B'], steps: ['chop', 'mix', 'bake', 'mix', 'bake', 'serve'] },
  { id: 910008, colors: ['#F2E2B8', '#F7B14B', '#D94F3D'], steps: ['ingredients', 'fry', 'mix', 'fry', 'fry', 'serve'] },
  { id: 910009, colors: ['#D5A35E', '#F5D56F', '#FFF0B8'], steps: ['ingredients', 'mix', 'fry', 'fry', 'boil', 'serve'] },
  { id: 910010, colors: ['#5EAA59', '#E64F3D', '#F3E8B0'], steps: ['boil', 'chop', 'ingredients', 'mix', 'serve', 'serve'] },
  { id: 910011, colors: ['#E8C48E', '#D64836', '#F7DE88'], steps: ['boil', 'fry', 'boil', 'mix', 'mix', 'serve'] },
  { id: 910012, colors: ['#D8B761', '#9A7954', '#6DA86A'], steps: ['chop', 'fry', 'fry', 'mix', 'boil', 'serve'] },
  { id: 910013, colors: ['#EBCB88', '#F6E6B2', '#D7874A'], steps: ['boil', 'chop', 'boil', 'fry', 'boil', 'serve'] },
  { id: 910014, colors: ['#DB4D3D', '#FFD76D', '#63A85B'], steps: ['chop', 'ingredients', 'mix', 'mix', 'bake', 'serve'] },
  { id: 910015, colors: ['#84B75F', '#D97543', '#E6C25E'], steps: ['chop', 'fry', 'fry', 'mix', 'boil', 'serve'] },
];

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
};

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

const blendPixel = (png, x, y, color, alpha = 1) => {
  if (x < 0 || y < 0 || x >= WIDTH || y >= HEIGHT) return;
  const idx = (WIDTH * Math.round(y) + Math.round(x)) << 2;
  png.data[idx] = clamp(png.data[idx] * (1 - alpha) + color[0] * alpha);
  png.data[idx + 1] = clamp(png.data[idx + 1] * (1 - alpha) + color[1] * alpha);
  png.data[idx + 2] = clamp(png.data[idx + 2] * (1 - alpha) + color[2] * alpha);
  png.data[idx + 3] = 255;
};

const fillRect = (png, x, y, w, h, color, alpha = 1) => {
  for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(HEIGHT, Math.ceil(y + h)); yy += 1) {
    for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(WIDTH, Math.ceil(x + w)); xx += 1) {
      blendPixel(png, xx, yy, color, alpha);
    }
  }
};

const fillEllipse = (png, cx, cy, rx, ry, color, alpha = 1) => {
  const minX = Math.floor(cx - rx);
  const maxX = Math.ceil(cx + rx);
  const minY = Math.floor(cy - ry);
  const maxY = Math.ceil(cy + ry);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) {
        blendPixel(png, x, y, color, alpha);
      }
    }
  }
};

const drawLine = (png, x1, y1, x2, y2, color, thickness = 4, alpha = 1) => {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t;
    fillEllipse(png, x, y, thickness, thickness, color, alpha);
  }
};

const drawRoundedRect = (png, x, y, w, h, radius, color, alpha = 1) => {
  fillRect(png, x + radius, y, w - radius * 2, h, color, alpha);
  fillRect(png, x, y + radius, w, h - radius * 2, color, alpha);
  fillEllipse(png, x + radius, y + radius, radius, radius, color, alpha);
  fillEllipse(png, x + w - radius, y + radius, radius, radius, color, alpha);
  fillEllipse(png, x + radius, y + h - radius, radius, radius, color, alpha);
  fillEllipse(png, x + w - radius, y + h - radius, radius, radius, color, alpha);
};

const drawNoise = (png, seed) => {
  let value = seed * 9301 + 49297;
  for (let i = 0; i < 7200; i += 1) {
    value = (value * 233280 + 12345) % 2147483647;
    const x = value % WIDTH;
    value = (value * 233280 + 12345) % 2147483647;
    const y = value % HEIGHT;
    const shade = 210 + (value % 35);
    blendPixel(png, x, y, [shade, shade - 7, shade - 16], 0.18);
  }
};

const drawBackground = (png, seed) => {
  fillRect(png, 0, 0, WIDTH, HEIGHT, [237, 230, 218]);
  fillRect(png, 0, 0, WIDTH, 96, [231, 214, 188], 0.35);
  fillRect(png, 0, HEIGHT - 88, WIDTH, 88, [213, 196, 172], 0.4);
  drawNoise(png, seed);
  drawLine(png, 28, 72, 340, 36, [197, 154, 91], 8, 0.35);
  drawLine(png, 680, 54, 930, 106, [184, 149, 92], 6, 0.25);
};

const drawKnife = (png, x, y) => {
  drawLine(png, x, y, x + 210, y - 36, [210, 213, 214], 10, 1);
  drawLine(png, x + 160, y - 28, x + 238, y - 46, [92, 62, 42], 13, 1);
};

const drawBoard = (png, x, y, w, h) => {
  drawRoundedRect(png, x, y, w, h, 36, [202, 148, 88], 1);
  drawRoundedRect(png, x + 14, y + 14, w - 28, h - 28, 28, [222, 177, 111], 1);
  drawLine(png, x + 52, y + 48, x + w - 70, y + 32, [160, 111, 68], 3, 0.35);
  drawLine(png, x + 80, y + h - 54, x + w - 55, y + h - 28, [160, 111, 68], 3, 0.28);
};

const scatterFood = (png, colors, cx, cy, count, spreadX, spreadY, minR = 14, maxR = 34) => {
  const palette = colors.map(hexToRgb);
  for (let i = 0; i < count; i += 1) {
    const angle = (i * 137.5 * Math.PI) / 180;
    const radius = ((i * 43) % 100) / 100;
    const x = cx + Math.cos(angle) * spreadX * radius;
    const y = cy + Math.sin(angle) * spreadY * radius;
    const r = minR + ((i * 17) % (maxR - minR + 1));
    fillEllipse(png, x + 8, y + 12, r * 1.05, r * 0.62, [70, 57, 46], 0.16);
    fillEllipse(png, x, y, r, r * 0.72, palette[i % palette.length], 1);
    fillEllipse(png, x - r * 0.24, y - r * 0.22, r * 0.25, r * 0.16, [255, 246, 220], 0.32);
  }
};

const drawPlate = (png, x, y, rx, ry) => {
  fillEllipse(png, x + 8, y + 18, rx * 1.08, ry * 1.05, [93, 78, 66], 0.16);
  fillEllipse(png, x, y, rx, ry, [236, 232, 221], 1);
  fillEllipse(png, x, y, rx * 0.78, ry * 0.68, [204, 199, 188], 1);
};

const drawPan = (png, x, y) => {
  drawLine(png, x - 90, y + 28, x - 310, y + 72, [39, 37, 35], 24, 1);
  fillEllipse(png, x, y + 28, 270, 122, [39, 37, 35], 1);
  fillEllipse(png, x, y, 254, 112, [19, 20, 21], 1);
  fillEllipse(png, x, y - 10, 214, 78, [45, 49, 45], 1);
};

const drawPot = (png, x, y) => {
  fillRect(png, x - 260, y - 40, 520, 190, [58, 63, 64], 1);
  fillEllipse(png, x, y - 40, 260, 78, [42, 44, 45], 1);
  fillEllipse(png, x, y - 48, 226, 52, [214, 198, 156], 1);
  fillEllipse(png, x, y + 150, 260, 54, [31, 32, 34], 1);
  drawLine(png, x - 312, y + 22, x - 380, y + 10, [45, 47, 49], 18, 1);
  drawLine(png, x + 312, y + 22, x + 380, y + 10, [45, 47, 49], 18, 1);
};

const drawSteam = (png, x, y) => {
  for (let i = 0; i < 4; i += 1) {
    const startX = x + i * 46 - 70;
    drawLine(png, startX, y, startX + 24, y - 42, [255, 255, 255], 5, 0.38);
    drawLine(png, startX + 24, y - 42, startX + 4, y - 86, [255, 255, 255], 5, 0.25);
  }
};

const drawAction = (png, action, colors, seed) => {
  const primary = hexToRgb(colors[0]);
  const secondary = hexToRgb(colors[1]);
  const accent = hexToRgb(colors[2]);

  if (action === 'ingredients') {
    drawBoard(png, 92, 132, 420, 260);
    drawKnife(png, 184, 254);
    drawPlate(png, 680, 270, 210, 118);
    scatterFood(png, colors, 680, 262, 17, 150, 72);
    fillEllipse(png, 254, 240, 42, 30, primary, 1);
    fillEllipse(png, 322, 292, 34, 26, secondary, 1);
    fillEllipse(png, 386, 238, 28, 22, accent, 1);
    return;
  }

  if (action === 'chop') {
    drawBoard(png, 124, 108, 620, 324);
    scatterFood(png, colors, 442, 274, 28, 210, 110, 10, 24);
    drawKnife(png, 384, 214);
    fillEllipse(png, 758, 134, 84, 52, [245, 236, 210], 1);
    return;
  }

  if (action === 'fry') {
    drawPan(png, 520, 306);
    scatterFood(png, colors, 520, 268, 26, 180, 60, 12, 30);
    drawSteam(png, 502, 200);
    fillRect(png, 96, 112, 142, 92, [247, 210, 78], 1);
    fillEllipse(png, 166, 112, 72, 22, [254, 233, 136], 1);
    return;
  }

  if (action === 'boil') {
    drawPot(png, 504, 270);
    scatterFood(png, colors, 506, 224, 18, 160, 42, 9, 22);
    for (let i = 0; i < 11; i += 1) {
      fillEllipse(png, 370 + i * 30, 210 + ((i * 19) % 36), 12, 8, [255, 255, 255], 0.45);
    }
    drawSteam(png, 504, 160);
    return;
  }

  if (action === 'bake') {
    drawRoundedRect(png, 164, 126, 632, 314, 30, [66, 61, 55], 1);
    drawRoundedRect(png, 196, 152, 568, 260, 24, [224, 199, 157], 1);
    scatterFood(png, colors, 486, 280, 18, 220, 90, 24, 48);
    drawLine(png, 206, 394, 756, 380, [156, 119, 78], 5, 0.32);
    fillEllipse(png, 768, 112, 52, 40, [255, 241, 208], 1);
    return;
  }

  if (action === 'mix') {
    fillEllipse(png, 490, 330, 284, 112, [82, 72, 68], 0.2);
    fillEllipse(png, 490, 286, 270, 130, [49, 52, 54], 1);
    fillEllipse(png, 490, 258, 228, 78, [236, 226, 199], 1);
    scatterFood(png, colors, 490, 250, 22, 158, 54, 10, 26);
    drawLine(png, 610, 172, 420, 298, [188, 167, 128], 12, 1);
    drawLine(png, 622, 166, 712, 110, [121, 80, 48], 12, 1);
    return;
  }

  drawPlate(png, 492, 292, 286, 148);
  scatterFood(png, colors, 492, 276, 30, 190, 70, 12, 34);
  drawLine(png, 684, 170, 780, 122, [54, 56, 58], 7, 0.7);
  drawLine(png, 190, 430, 760, 430, [190, 171, 140], 5, 0.3);
  fillEllipse(png, 322, 192, 28, 14, [92, 145, 75], 1);
  fillEllipse(png, 662, 210, 24, 12, [92, 145, 75], 1);
};

const writeImage = (recipe, index, action) => {
  const png = new PNG({ width: WIDTH, height: HEIGHT });
  drawBackground(png, recipe.id + index);
  drawAction(png, action, recipe.colors, recipe.id + index);

  const buffer = PNG.sync.write(png, {
    colorType: 6,
    inputColorType: 6,
    deflateLevel: 9,
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${recipe.id}-${index + 1}.png`), buffer);
};

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

for (const recipe of recipes) {
  recipe.steps.forEach((action, index) => writeImage(recipe, index, action));
}

console.log(`Generated ${recipes.length * 6} step images in ${OUTPUT_DIR}`);
