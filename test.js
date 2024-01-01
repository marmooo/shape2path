import { assertEquals } from "https://deno.land/std/assert/mod.ts";
import { HTMLElement, parse } from "npm:node-html-parser@6.1.10";
import { shape2path } from "./mod.js";

const inSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <rect width="100" height="100" />
  <rect x="110" y="10" width="80" height="80" rx="15" />
  <circle cx="250" cy="50" r="50" />
  <ellipse cx="200" cy="150" rx="100" ry="50" />
  <line x1="0" y1="180" x2="100" y2="120" stroke="black" />
  <polyline points="0,300 50,225 50,275 100,200" />
  <polyline points="100,300 150,225 150,275 200,200" fill="none" stroke="black" />
  <polygon points="200,300 250,225 250,275 300,200" fill="none" stroke="black" />
</svg>
`;
const outSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
  <path width="100" height="100" d="M0 0h100v100h-100z"></path>
  <path x="110" y="10" width="80" height="80" rx="15" d="M110 25
a15 15 0 0 1 15 -15
h50
a15 15 0 0 1 15 15
v50
a15 15 0 0 1 -15 15
h-50
a15 15 0 0 1 -15 -15
z"></path>
  <path d="M 200 50 A 50 50 0 1 0 300 50 A 50 50 0 1 0 200 50"></path>
  <path d="M 100 150 A 100 50 0 1 0 300 150 A 100 50 0 1 0 100 150"></path>
  <path stroke="black" d="M0 180L100 120"></path>
  <path d="M0 300L50 225 50 275 100 200"></path>
  <path fill="none" stroke="black" d="M100 300L150 225 150 275 200 200"></path>
  <path fill="none" stroke="black" d="M200 300L250 225 250 275 300 200z"></path>
</svg>
`;

const options = {
  voidTag: {
    tags: ["path"],
    closingSlash: true,
  },
};

function createPath(node) {
  const path = new HTMLElement("path", {});
  for (const [name, value] of Object.entries(node.attributes)) {
    path.setAttribute(name, value);
  }
  return path;
}
const doc = parse(inSvg, options);
shape2path(doc, createPath);
assertEquals(doc.toString(), outSvg);
