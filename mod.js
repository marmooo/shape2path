export class Circle {
  constructor(cx, cy, rx, ry) {
    this.cx = cx;
    this.cy = cy;
    this.rx = rx;
    this.ry = ry;
  }

  toSVG() {
    return `<path d="${this.d()}"/>`;
  }

  d() {
    return this.toArray().map((line) => line.join(" ")).join(" ");
  }
}

export class TwoArcsCircle extends Circle {
  constructor(cx, cy, rx, ry) {
    super(cx, cy, rx, ry);
  }

  toArray() {
    const { cx, cy, rx, ry } = this;
    return [
      ["M", cx - rx, cy],
      ["A", rx, ry, 0, 1, 0, cx + rx, cy],
      ["A", rx, ry, 0, 1, 0, cx - rx, cy],
    ];
  }
}

export class CubicBezierCircle extends Circle {
  static KAPPA = (-1 + Math.sqrt(2)) / 3 * 4;

  constructor(cx, cy, rx, ry) {
    super(cx, cy, rx, ry);
  }

  toArray() {
    const { cx, cy, rx, ry } = this;
    const kappa = CubicBezierCircle.KAPPA;
    return [
      ["M", cx - rx, cy],
      ["C", cx - rx, cy - kappa * ry, cx - kappa * rx, cy - ry, cx, cy - ry],
      ["C", cx + kappa * rx, cy - ry, cx + rx, cy - kappa * ry, cx + rx, cy],
      ["C", cx + rx, cy + kappa * ry, cx + kappa * rx, cy + ry, cx, cy + ry],
      ["C", cx - kappa * rx, cy + ry, cx - rx, cy + kappa * ry, cx - rx, cy],
    ];
  }
}

export class QuadBezierCircle extends Circle {
  constructor(cx, cy, rx, ry, segments = 8) {
    super(cx, cy, rx, ry);
    this.segments = segments;
  }

  toArray() {
    const ANGLE = 2 * Math.PI / this.segments;
    const { cx, cy, rx, ry } = this;
    const calculateControlPoint = (theta) => {
      const ax = rx * Math.cos(theta);
      const ay = ry * Math.sin(theta);
      const cpx = ax + rx * Math.tan(ANGLE / 2) * Math.cos(theta - Math.PI / 2);
      const cpy = ay + ry * Math.tan(ANGLE / 2) * Math.sin(theta - Math.PI / 2);
      return [cpx, cpy, ax, ay];
    };

    const pathData = [["M", cx + rx, cy]];
    for (let index = 1; index <= this.segments; index++) {
      const theta = index * ANGLE;
      const [cpx, cpy, ax, ay] = calculateControlPoint(theta);
      pathData.push(["Q", cpx + cx, cpy + cy, ax + cx, ay + cy]);
    }
    return pathData;
  }

  range(from, to) {
    const d = to - from;
    return [...Array(d + 1).keys()].map((n) => n + from);
  }
}

function selectCircle(cx, cy, rx, ry, options) {
  const segments = options.circleSegments || 8;
  switch (options.circleAlgorithm) {
    case "TwoArcs":
      return new TwoArcsCircle(cx, cy, rx, ry);
    case "CubicBezier":
      return new CubicBezierCircle(cx, cy, rx, ry);
    case "QuadBezier":
      return new QuadBezierCircle(cx, cy, rx, ry, segments);
    default:
      return new TwoArcsCircle(cx, cy, rx, ry);
  }
}

export function circleToPath(node, createPathFunc, options) {
  const cx = Number(node.getAttribute("cx"));
  const cy = Number(node.getAttribute("cy"));
  const r = Number(node.getAttribute("r"));
  const d = selectCircle(cx, cy, r, r, options).d();
  const path = createPathFunc(node);
  path.setAttribute("d", d);
  ["cx", "cy", "r"].forEach((attribute) => {
    path.removeAttribute(attribute);
  });
  node.replaceWith(path);
  return path;
}

export function ellipseToPath(node, createPathFunc, options) {
  const cx = Number(node.getAttribute("cx"));
  const cy = Number(node.getAttribute("cy"));
  const rx = Number(node.getAttribute("rx"));
  const ry = Number(node.getAttribute("ry"));
  const d = selectCircle(cx, cy, rx, ry, options).d();
  const path = createPathFunc(node);
  path.setAttribute("d", d);
  ["cx", "cy", "rx", "ry"].forEach((attribute) => {
    path.removeAttribute(attribute);
  });
  node.replaceWith(path);
  return path;
}

export function rectToPath(node, createPathFunc) {
  const x = Number(node.getAttribute("x")) || 0;
  const y = Number(node.getAttribute("y")) || 0;
  const width = Number(node.getAttribute("width"));
  const height = Number(node.getAttribute("height"));
  const ax = Number(node.getAttribute("rx"));
  const ay = Number(node.getAttribute("ry"));
  const rx = Math.min(ax || ay || 0, width / 2);
  const ry = Math.min(ay || ax || 0, height / 2);

  let d;
  if (rx === 0 || ry === 0) {
    d = `M${x} ${y}h${width}v${height}h${-width}z`;
  } else {
    d = `M${x} ${y + ry}
a${rx} ${ry} 0 0 1 ${rx} ${-ry}
h${width - rx - rx}
a${rx} ${ry} 0 0 1 ${rx} ${ry}
v${height - ry - ry}
a${rx} ${ry} 0 0 1 ${-rx} ${ry}
h${rx + rx - width}
a${rx} ${ry} 0 0 1 ${-rx} ${-ry}
z`;
  }
  const path = createPathFunc(node);
  path.setAttribute("d", d);
  ["cx", "cy", "r"].forEach((attribute) => {
    path.removeAttribute(attribute);
  });
  node.replaceWith(path);
  return path;
}

export function lineToPath(node, createPathFunc) {
  const x1 = node.getAttribute("x1");
  const y1 = node.getAttribute("y1");
  const x2 = node.getAttribute("x2");
  const y2 = node.getAttribute("y2");
  const d = `M${x1} ${y1}L${x2} ${y2}`;
  const path = createPathFunc(node);
  path.setAttribute("d", d);
  ["x1", "y1", "x2", "y2"].forEach((attribute) => {
    path.removeAttribute(attribute);
  });
  node.replaceWith(path);
  return path;
}

export function polylineToPath(node, createPathFunc) {
  const points = node.getAttribute("points")
    .trim().replaceAll(",", " ").split(/\s+/).map(Number);
  const xy1 = points.slice(0, 2).join(" ");
  const xy2 = points.slice(2).join(" ");
  let d = `M${xy1}L${xy2}`;
  if (node.tagName.toLowerCase() === "polygon") d += "z";
  const path = createPathFunc(node);
  path.setAttribute("d", d);
  path.removeAttribute("points");
  node.replaceWith(path);
  return path;
}

function* traverse(element) {
  yield element;
  const childNodes = element.childNodes;
  if (childNodes) {
    for (let i = 0; i < childNodes.length; i++) {
      yield* traverse(childNodes[i]);
    }
  }
}

export function shape2path(doc, createPathFunc, options = {}) {
  for (const node of traverse(doc)) {
    if (!node.tagName) continue;
    switch (node.tagName.toLowerCase()) {
      case "rect":
        rectToPath(node, createPathFunc);
        break;
      case "circle":
        circleToPath(node, createPathFunc, options);
        break;
      case "ellipse":
        ellipseToPath(node, createPathFunc, options);
        break;
      case "line":
        lineToPath(node, createPathFunc);
        break;
      case "polyline":
      case "polygon":
        polylineToPath(node, createPathFunc);
        break;
    }
  }
}
