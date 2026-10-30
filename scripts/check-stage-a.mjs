import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import {
  geometry,
  center,
  ringSpecs,
  poses,
} from "../public/stage-a/model.mjs";
import { rotation, project } from "../public/stage-a/scene.mjs";

const { groups, parts } = geometry();
const shells = ringSpecs.map(() => ({ min: Infinity, max: 0 }));
const characters = { Clawd: Infinity, GPT: Infinity },
  characterBounds = { Clawd: Infinity, GPT: Infinity };
let triangles = 0,
  wrongWinding = 0;
for (const [material, data] of groups) {
  assert(data.every(Number.isFinite), `${material}: non-finite geometry`);
  for (let i = 0; i < data.length; i += 7) {
    const [x, y, z, nx, ny, nz, joint] = data.slice(i, i + 7);
    assert(
      Math.abs(Math.hypot(nx, ny, nz) - 1) < 1e-5,
      `${material}: non-unit normal`,
    );
    if (joint) {
      const r = Math.hypot(x, y, z),
        shell = shells[joint - 1];
      shell.min = Math.min(shell.min, r);
      shell.max = Math.max(shell.max, r);
    }
  }
  for (let i = 0; i < data.length; i += 21) {
    triangles++;
    const a = data.slice(i, i + 3),
      b = data.slice(i + 7, i + 10).map((v, k) => v - a[k]),
      c = data.slice(i + 14, i + 17).map((v, k) => v - a[k]);
    const n = [
      b[1] * c[2] - b[2] * c[1],
      b[2] * c[0] - b[0] * c[2],
      b[0] * c[1] - b[1] * c[0],
    ];
    if (Math.hypot(...n) < 1e-9) continue;
    const dot = n.reduce(
      (sum, v, k) =>
        sum + v * (data[i + 3 + k] + data[i + 10 + k] + data[i + 17 + k]),
      0,
    );
    if (dot < -1e-8) wrongWinding++;
  }
}
assert.equal(wrongWinding, 0, `inward triangles: ${wrongWinding}`);
for (const part of parts) {
  assert(part.count > 0, `${part.name}: empty component`);
  const character = Object.keys(characters).find((name) =>
    part.name.startsWith(name + "."),
  );
  if (character) {
    const data = groups.get(part.material);
    for (let i = part.start * 7; i < (part.start + part.count) * 7; i += 7) {
      characters[character] = Math.min(
        characters[character],
        Math.hypot(...data.slice(i, i + 3).map((v, k) => v - center[k])),
      );
    }
  }
  if (character) {
    const data = groups.get(part.material);
    for (let i = part.start * 7; i < (part.start + part.count) * 7; i += 21) {
      const vertices = [0, 7, 14].map((offset) =>
          data.slice(i + offset, i + offset + 3),
        ),
        c = [0, 1, 2].map(
          (k) => vertices.reduce((sum, p) => sum + p[k], 0) / 3,
        ),
        radius = Math.max(
          ...vertices.map((p) => Math.hypot(...p.map((v, k) => v - c[k]))),
        );
      characterBounds[character] = Math.min(
        characterBounds[character],
        Math.hypot(...c.map((v, k) => v - center[k])) - radius,
      );
    }
  }
  assert(
    !/pillar|bearing|support|axle/i.test(part.name),
    `visible support: ${part.name}`,
  );
}
assert.equal(parts.filter((p) => /^Clawd\.leg\./.test(p.name)).length, 8);
assert.equal(new Set(parts.map((p) => p.name)).size, parts.length);
const gaps = [
  shells[0].min - shells[1].max,
  shells[1].min - shells[2].max,
  shells[2].min - 61,
];
assert(
  gaps.every((gap) => gap > 15),
  "ring/core clearance too small",
);
for (const [name, distance] of Object.entries(characterBounds))
  assert(
    distance > shells[0].max + 2,
    `${name} enters swept ring volume: ${distance}`,
  );
// Rotation preserves the bounding shells, so this separation holds for every pose.
for (const angles of [...poses, [360, 360, 360], [-90, 180, 270]])
  for (let joint = 0; joint < 3; joint++) {
    const m = rotation(angles, joint),
      p = [37, 51, 86],
      q = [0, 1, 2].map((i) => m[i] * p[0] + m[3 + i] * p[1] + m[6 + i] * p[2]);
    assert(Math.abs(Math.hypot(...p) - Math.hypot(...q)) < 1e-9);
    assert(project(q).every(Number.isFinite));
  }
console.log(
  JSON.stringify(
    {
      parts: parts.length,
      triangles,
      wrongWinding,
      shells,
      gaps,
      characterDistance: characters,
      characterBounds,
      poses,
    },
    null,
    2,
  ),
);

writeFileSync(
  new URL("../docs/visual/stage-a/components.json", import.meta.url),
  "[\n" +
    parts
      .map(({ name, material, joint }) =>
        JSON.stringify({ name, material, joint }),
      )
      .join(",\n") +
    "\n]\n",
);
