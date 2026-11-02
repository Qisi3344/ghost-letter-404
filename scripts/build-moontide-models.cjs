// Offline extraction; Three.js is only required when regenerating these assets.
const fs = require("node:fs"),
  path = require("node:path");
if (!process.env.THREE_PATH)
  throw Error("Set THREE_PATH to moontide-isle/vendor/three.min.js (r146).");
const THREE = require(path.resolve(process.env.THREE_PATH));
const root = path.resolve(__dirname, "../public/stage-a");
const source = fs.readFileSync(path.join(root, "moontide-source.js"), "utf8");
const { clawd, gpt, knot } = Function(
  "THREE",
  "toonMat",
  "lc",
  source +
    ";return {clawd:makeClawd(),gpt:buildXiaoG(THREE),knot:moontideKnot};",
)(
  THREE,
  (c) => new THREE.MeshStandardMaterial({ color: c }),
  (c) => c,
);
clawd.updateMatrixWorld(true);
const meshes = [];
clawd.traverseVisible((o) => {
  if (!o.isMesh) return;
  const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
  meshes.push({
    position: Array.from(g.attributes.position.array),
    normal: Array.from(g.attributes.normal.array),
    index: g.index ? Array.from(g.index.array) : null,
    color: o.material.color.getHex(),
    leg: clawd.userData.legs.findIndex((l) => l.children.includes(o)),
  });
});
const out = {
  clawd: meshes,
  gpt: {
    position: Array.from(gpt.geo.attributes.position.array),
    normal: Array.from(gpt.geo.attributes.normal.array),
    index: Array.from(gpt.geo.index.array),
    height: gpt.height,
    knotCenter: [0.03 * 1.25, 0.62 * 1.25 + gpt.dy],
    knotWidth: 2.05,
  },
  knot,
};
fs.writeFileSync(
  path.join(root, "moontide-models.mjs"),
  "// Model geometry extracted from Qisi3344/moontide-isle; see docs/MOONTIDE_MODELS.md.\nexport default " +
    JSON.stringify(out, (k, v) =>
      typeof v === "number" && !Number.isInteger(v)
        ? Math.round(v * 1e6) / 1e6
        : v,
    ) +
    ";\n",
);
console.log({
  clawdMeshes: meshes.length,
  gptVertices: gpt.geo.attributes.position.count,
  gptHeight: gpt.height,
  knotCenter: out.gpt.knotCenter,
});
