# @marmooo/shape2path

Convert SVG basic shape (rect, circle, ellipse, line, polyline, polygon) to
path.

## Usage

```
import { shape2path } from "@marmooo/shape2path";

// browser
function createPathRemote(node) {
  const namespace = "http://www.w3.org/2000/svg";
  const path = document.createElementNS(namespace, "path");
  for (const attribute of node.attributes) {
    path.setAttribute(attribute.name, attribute.value);
  }
  return path;
}

// node-html-parser
function createPathLocal(node) {
  const path = new HTMLElement("path", {});
  for (const [name, value] of Object.entries(node.attributes)) {
    path.setAttribute(name, value);
  }
  return path;
}

const options = {
  circleAlgorithm: "QuadBezier", // ["TwoArcs", "CubicBezier", "QuadBezier"]
  circleSegments: 8, // numer of arcs used in QuadBezier algorithm
};
shape2path(svgString, createPathRemote, options);
```

## Example

from

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="100" height="100" />
  <circle cx="250" cy="50" r="50" />
  <polyline points="0,300 50,225 50,275 100,200" />
</svg>
```

to

```
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <path width="100" height="100" d="M0 0h100v100h-100z" />
  <path d="M 200 50 A 50 50 0 1 0 300 50 A 50 50 0 1 0 200 50" />
  <path d="M0 300L50 225 50 275 100 200" />
</svg>
```

## License

MIT

## References

- [svgo]("https://github.com/svg/svgo)
- [convertPath](https://github.com/convertSvg/convertPath)
- [SVGPathConverter](https://github.com/Waest/SVGPathConverter)
- [svg-flatten](https://github.com/stadline/svg-flatten)
- [SVG の \<circle\> を \<path\> で描く](https://tyru.github.io/svg-circle-misc-algorithm/)
