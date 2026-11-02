import moonModels from "./moontide-models.mjs";
export const materials = {
  brass: { color: [0.62, 0.32, 0.095], metal: 0.86, rough: 0.27 },
  edge: { color: [0.78, 0.57, 0.29], metal: 0.9, rough: 0.2 },
  dark: { color: [0.022, 0.014, 0.039], metal: 0.15, rough: 0.65 },
  black: { color: [0.014, 0.017, 0.028], metal: 0.45, rough: 0.36 },
  steel: { color: [0.21, 0.19, 0.29], metal: 0.85, rough: 0.24 },
  purple: { color: [0.17, 0.055, 0.29], metal: 0.12, rough: 0.55 },
  cloth: { color: [0.79, 0.76, 0.8], metal: 0, rough: 0.75 },
  orange: { color: [0.74, 0.25, 0.065], metal: 0.08, rough: 0.49 },
  eye: { color: [0.014, 0.055, 0.12], metal: 0.3, rough: 0.22 },
  light: { color: [0.53, 0.33, 0.95], metal: 0.25, rough: 0.2, emission: 1.4 },
  crystal: {
    color: [0.9, 0.56, 0.2],
    metal: 0.35,
    rough: 0.18,
    emission: 0.24,
  },
  glass: { color: [0.29, 0.22, 0.47], metal: 0.1, rough: 0.12 },
  floor: { color: [0.026, 0.02, 0.041], metal: 0.15, rough: 0.8 },
};
materials["moon-orange"] = {
  color: [0.694, 0.184, 0.095],
  metal: 0,
  rough: 0.58,
};
materials["moon-eye"] = { color: [0.027, 0.042, 0.107], metal: 0, rough: 0.5 };
materials["moon-white"] = { color: [0.965, 0.982, 1], metal: 0, rough: 0.75 };
materials["moon-gpt"] = { color: [0.922, 0.88, 0.823], metal: 0, rough: 0.92 };
export const gptPlacement = {
  x: 188,
  y: -68,
  z: 125,
  height: 76,
  scale: 76 / moonModels.gpt.height,
  knotCenter: moonModels.gpt.knotCenter,
  knotWidth: moonModels.gpt.knotWidth,
};
export const knotPath = moonModels.knot;
export const center = [0, 0, 236];
export const poses = [
  [12, 54, 62],
  [-18, 82, 38],
  [30, 30, 105],
];
export const ringSpecs = [
  { r: 151, w: 12, h: 9 },
  { r: 120, w: 10, h: 8 },
  { r: 91, w: 8, h: 7 },
];
export const groups = new Map(),
  parts = [];
const TAU = Math.PI * 2;
const norm = (a) => {
  const l = Math.hypot(...a) || 1;
  return a.map((x) => x / l);
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export function geometry() {
  groups.clear();
  parts.length = 0;
  let mat = "brass",
    joint = 0,
    active;
  const names = new Map();
  const finish = () => {
    if (active)
      active.count = groups.get(active.material).length / 7 - active.start;
  };
  const begin = (id, m = "brass", j = 0) => {
    finish();
    mat = m;
    joint = j;
    if (!groups.has(m)) groups.set(m, []);
    const n = names.get(id) || 0;
    names.set(id, n + 1);
    active = {
      name: n ? id + "." + n : id,
      material: m,
      joint: j,
      start: groups.get(m).length / 7,
      count: 0,
    };
    parts.push(active);
  };
  const vertex = (p, n) => groups.get(mat).push(...p, ...n, joint);
  const quad = (p, n) => {
    for (const i of [0, 1, 2, 0, 2, 3]) vertex(p[i], n[i]);
  };
  const face = (p) => {
    const n = norm(
      cross(
        p[1].map((x, i) => x - p[0][i]),
        p[2].map((x, i) => x - p[0][i]),
      ),
    );
    for (let i = 1; i < p.length - 1; i++)
      for (const v of [p[0], p[i], p[i + 1]]) vertex(v, n);
  };
  function box(id, c, size, m = "dark", bevel = 1.5) {
    begin(id, m);
    const h = size.map((x) => x / 2),
      r = Math.min(bevel, ...h),
      steps = 6;
    for (let axis = 0; axis < 3; axis++)
      for (const sign of [-1, 1]) {
        const point = (i, j) => {
          const p = [0, 0, 0],
            u = (axis + 1) % 3,
            v = (axis + 2) % 3;
          p[axis] = h[axis] * sign;
          p[u] = ((i / steps) * 2 - 1) * h[u];
          p[v] = ((j / steps) * 2 - 1) * h[v];
          const q = p.map((x, a) => Math.max(-h[a] + r, Math.min(h[a] - r, x))),
            n = norm(p.map((x, a) => x - q[a]));
          return { p: q.map((x, a) => c[a] + x + n[a] * r), n };
        };
        for (let i = 0; i < steps; i++)
          for (let j = 0; j < steps; j++) {
            const q = [
              point(i, j),
              point(i + 1, j),
              point(i + 1, j + 1),
              point(i, j + 1),
            ];
            if (sign < 0) q.reverse();
            quad(
              q.map((x) => x.p),
              q.map((x) => x.n),
            );
          }
      }
  }
  function lathe(id, c, profile, m = "brass", steps = 128, j = 0) {
    begin(id, m, j);
    for (let row = 0; row < profile.length - 1; row++) {
      const [z0, r0] = profile[row],
        [z1, r1] = profile[row + 1],
        dz = z1 - z0,
        dr = r1 - r0;
      for (let i = 0; i < steps; i++) {
        const a = (i * TAU) / steps,
          b = ((i + 1) * TAU) / steps;
        const p = [
          [c[0] + r0 * Math.cos(a), c[1] + r0 * Math.sin(a), c[2] + z0],
          [c[0] + r0 * Math.cos(b), c[1] + r0 * Math.sin(b), c[2] + z0],
          [c[0] + r1 * Math.cos(b), c[1] + r1 * Math.sin(b), c[2] + z1],
          [c[0] + r1 * Math.cos(a), c[1] + r1 * Math.sin(a), c[2] + z1],
        ];
        const n = (t) => norm([dz * Math.cos(t), dz * Math.sin(t), -dr]);
        quad(p, [n(a), n(b), n(b), n(a)]);
      }
    }
  }
  function disc(id, c, r, h, m = "brass", bevel = 0.6, j = 0) {
    const b = Math.min(bevel, h / 3);
    lathe(
      id,
      c,
      [
        [0, 0],
        [0, r - b],
        [b, r],
        [h - b, r],
        [h, r - b],
        [h, 0],
      ],
      m,
      96,
      j,
    );
  }
  // Closed, bevelled annular sectors form actual access decks above the driver bays.
  function sector(id, inner, outer, z, h, a, b, m = "dark") {
    begin(id, m);
    const bevel = Math.min(0.8, h / 3),
      profile = [
        [inner + bevel, z],
        [outer - bevel, z],
        [outer, z + bevel],
        [outer, z + h - bevel],
        [outer - bevel, z + h],
        [inner + bevel, z + h],
        [inner, z + h - bevel],
        [inner, z + bevel],
      ];
    const point = (v, t) => [v[0] * Math.cos(t), v[0] * Math.sin(t), v[1]];
    for (let k = 0; k < 8; k++) {
      const v = profile[k],
        w = profile[(k + 1) % 8],
        dr = w[0] - v[0],
        dz = w[1] - v[1],
        normal = (t) => norm([dz * Math.cos(t), dz * Math.sin(t), -dr]);
      for (let j = 0; j < 48; j++) {
        const t = a + ((b - a) * j) / 48,
          u = a + ((b - a) * (j + 1)) / 48;
        quad(
          [point(v, t), point(v, u), point(w, u), point(w, t)],
          [normal(t), normal(u), normal(u), normal(t)],
        );
      }
    }
    face(profile.map((v) => point(v, a)));
    face(profile.map((v) => point(v, b)).reverse());
  }
  function torus(id, c, r, t, m = "brass", j = 0, steps = 192) {
    begin(id, m, j);
    const point = (i, k) => {
      const a = (i * TAU) / steps,
        b = (k * TAU) / 12,
        n = [Math.cos(a) * Math.cos(b), Math.sin(a) * Math.cos(b), Math.sin(b)];
      return {
        p: [
          c[0] + (r + t * Math.cos(b)) * Math.cos(a),
          c[1] + (r + t * Math.cos(b)) * Math.sin(a),
          c[2] + t * Math.sin(b),
        ],
        n,
      };
    };
    for (let i = 0; i < steps; i++)
      for (let k = 0; k < 12; k++) {
        const q = [
          point(i, k),
          point(i + 1, k),
          point(i + 1, k + 1),
          point(i, k + 1),
        ];
        quad(
          q.map((x) => x.p),
          q.map((x) => x.n),
        );
      }
  }
  function sphere(id, c, size, m = "cloth", rows = 32) {
    begin(id, m);
    const point = (i, j) => {
      const a = (i * Math.PI) / rows,
        b = (j * TAU) / (rows * 2),
        u = [Math.sin(a) * Math.cos(b), Math.sin(a) * Math.sin(b), Math.cos(a)];
      return {
        p: u.map((x, k) => c[k] + x * size[k]),
        n: norm(u.map((x, k) => x / size[k])),
      };
    };
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < rows * 2; j++) {
        const q = [
          point(i, j),
          point(i + 1, j),
          point(i + 1, j + 1),
          point(i, j + 1),
        ];
        quad(
          q.map((x) => x.p),
          q.map((x) => x.n),
        );
      }
  }
  function tube(id, points, r, m = "brass") {
    begin(id, m);
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i],
        b = points[i + 1],
        axis = norm(b.map((v, k) => v - a[k])),
        u = norm(cross(axis, Math.abs(axis[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1])),
        v = cross(axis, u);
      const ring = (p, t) => {
        const n = u.map((x, k) => x * Math.cos(t) + v[k] * Math.sin(t));
        return { p: p.map((x, k) => x + r * n[k]), n };
      };
      for (let j = 0; j < 10; j++) {
        const q = [
          ring(a, ((j + 1) * TAU) / 10),
          ring(b, ((j + 1) * TAU) / 10),
          ring(b, (j * TAU) / 10),
          ring(a, (j * TAU) / 10),
        ];
        quad(
          q.map((x) => x.p),
          q.map((x) => x.n),
        );
      }
    }
  }
  function screw(id, x, y, z, r = 2) {
    disc(id, [x, y, z], r, 1.6, "steel", 0.4);
    box(id + ".slot", [x, y, z + 1.6], [r * 1.4, 0.55, 0.2], "black", 0.1);
  }
  // A machined altar, recessed deck and continuous rolled lips.
  disc("ground", [0, 0, -10], 360, 5, "floor", 2);
  for (let i = 0; i < 6; i++) {
    const a = (i * TAU) / 6 + Math.PI / 12,
      x = 166 * Math.cos(a),
      y = 166 * Math.sin(a);
    disc("foot.pad." + i, [x, y, -5], 18, 5, "black", 1.4);
    disc("foot.body." + i, [x, y, 0], 12, 15, "dark", 2);
    disc("foot.collar." + i, [x, y, 14], 17, 3, "brass", 0.7);
  }
  lathe(
    "altar.body",
    [0, 0, 16],
    [
      [0, 0],
      [0, 190],
      [3, 198],
      [12, 198],
      [15, 194],
      [22, 194],
      [25, 200],
      [29, 200],
      [31, 194],
      [31, 172],
      [16, 172],
      [16, 0],
    ],
    "dark",
  );
  for (const [z, r] of [
    [18, 195],
    [29, 198],
    [42, 199],
    [46, 194],
  ])
    torus("altar.lip." + z, [0, 0, z], r, 1.2, "brass");
  lathe(
    "altar.deck",
    [0, 0, 46],
    [
      [0, 171],
      [0, 189],
      [1, 190],
      [2, 190],
      [3, 189],
      [3, 171],
      [2, 170],
      [1, 170],
      [0, 171],
    ],
    "dark",
  );
  torus("deck.inlay", [0, 0, 49.2], 176, 0.45, "edge");
  torus("deck.outer.inlay", [0, 0, 49.2], 184, 0.5, "brass");
  for (let i = 0; i < 96; i++) {
    const a = (i * TAU) / 96,
      r = 196;
    begin("skirt.vent." + i, "black");
    const b = a + 0.012;
    face([
      [r * Math.cos(a), r * Math.sin(a), 30],
      [r * Math.cos(b), r * Math.sin(b), 30],
      [r * Math.cos(b), r * Math.sin(b), 38],
      [r * Math.cos(a), r * Math.sin(a), 38],
    ]);
    if (i % 4 === 0)
      screw("deck.screw." + i, 181 * Math.cos(a), 181 * Math.sin(a), 49, 1.5);
  }
  // Six radial driver bays: the gaps expose insulated copper windings below the deck.
  for (let i = 0; i < 6; i++) {
    const a = ((i * 60 + 8) * Math.PI) / 180,
      b = a + (34 * Math.PI) / 180;
    sector("driver.deck." + i, 71, 176, 44, 5, a, b, "dark");
    sector(
      "driver.deck.trim." + i,
      170,
      175,
      49,
      0.9,
      a + 0.01,
      b - 0.01,
      "brass",
    );
    for (let k = 0; k < 7; k++)
      sector(
        "driver.winding." + i + "." + k,
        91 + k * 8,
        95 + k * 8,
        33,
        5,
        b + 0.035,
        a + TAU / 6 - 0.035,
        "brass",
      );
    sector(
      "driver.insulator." + i,
      84,
      153,
      32,
      1,
      b + 0.02,
      a + TAU / 6 - 0.02,
      "black",
    );
    for (const t of [a + 0.05, b - 0.05])
      for (const r of [79, 163])
        screw("driver.bolt." + i, r * Math.cos(t), r * Math.sin(t), 49, 1.4);
  }
  // Solid service bridges beneath Clawd and the control dock.
  sector(
    "operator.walkway",
    70,
    178,
    44,
    5,
    (114 * Math.PI) / 180,
    (188 * Math.PI) / 180,
    "dark",
  );
  // Central emitter is an inset lens and concentric induction windings, never a support.
  disc("emitter.housing", [0, 0, 32], 70, 17, "dark");
  disc("emitter.well", [0, 0, 49], 69, 3, "black");
  torus("emitter.rim", [0, 0, 52], 69, 1.6, "brass");
  for (let i = 0; i < 4; i++)
    torus(
      "induction." + i,
      [0, 0, 52],
      43 + i * 6,
      0.55,
      i === 2 ? "light" : "steel",
    );
  for (let i = 0; i < 12; i++) {
    const a = (i * TAU) / 12;
    screw("emitter.bolt." + i, 64 * Math.cos(a), 64 * Math.sin(a), 52, 1.5);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i * TAU) / 8;
    begin("emitter.iris." + i, i % 2 ? "steel" : "dark");
    face([
      [20 * Math.cos(a), 20 * Math.sin(a), 53],
      [40 * Math.cos(a + 0.05), 40 * Math.sin(a + 0.05), 53],
      [40 * Math.cos(a + 0.7), 40 * Math.sin(a + 0.7), 53],
      [20 * Math.cos(a + 0.9), 20 * Math.sin(a + 0.9), 53],
    ]);
  }
  disc("emitter.lens", [0, 0, 52.5], 20, 0.8, "purple");
  torus("emitter.lens.seal", [0, 0, 53], 20, 0.6, "edge");
  // Three independent closed ring bands, all with chamfered eight-face sections.
  ringSpecs.forEach((s, index) => {
    const r = s.r,
      w = s.w / 2,
      h = s.h / 2;
    lathe(
      "orbit.band." + index,
      [0, 0, 0],
      [
        [-h, r - w + 0.8],
        [-h, r + w - 0.8],
        [-h + 0.8, r + w],
        [h - 0.8, r + w],
        [h, r + w - 0.8],
        [h, r - w + 0.8],
        [h - 0.8, r - w],
        [-h + 0.8, r - w],
        [-h, r - w + 0.8],
      ],
      "brass",
      256,
      index + 1,
    );
    torus(
      "orbit.outer.trim." + index,
      [0, 0, h - 0.5],
      r + w - 0.7,
      0.45,
      "edge",
      index + 1,
    );
    torus(
      "orbit.inner.trim." + index,
      [0, 0, h - 0.5],
      r - w + 0.7,
      0.4,
      "edge",
      index + 1,
    );
    torus(
      "orbit.machined.groove." + index,
      [0, 0, h + 0.02],
      r - w + 1.6,
      0.22,
      "black",
      index + 1,
    );
    for (let i = 0; i < 120; i++) {
      const a = (i * TAU) / 120,
        span = 0.0018,
        outer = r + w - 1.2,
        inner = outer - (i % 10 === 0 ? 5 : i % 5 === 0 ? 3.5 : 1.8);
      begin("orbit.tick." + index + "." + i, "black", index + 1);
      face([
        [outer * Math.cos(a - span), outer * Math.sin(a - span), h + 0.03],
        [outer * Math.cos(a + span), outer * Math.sin(a + span), h + 0.03],
        [inner * Math.cos(a + span), inner * Math.sin(a + span), h + 0.03],
        [inner * Math.cos(a - span), inner * Math.sin(a - span), h + 0.03],
      ]);
    }
  });
  // Glass shell and inner faceted star: both are real depth-tested surfaces.
  sphere("star.glass", center, [61, 61, 61], "glass", 48);
  begin("star.crystal", "crystal");
  // Six pyramidal points emerge from a small shared core, making a true 3D star.
  for (let axis = 0; axis < 3; axis++)
    for (const sign of [-1, 1]) {
      const tip = [0, 0, 0];
      tip[axis] = sign * (axis === 2 ? 36 : 29);
      const corners = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ].map(([u, v]) => {
        const p = [0, 0, 0];
        p[axis] = sign * 7;
        p[(axis + 1) % 3] = u * 7;
        p[(axis + 2) % 3] = v * 7;
        return p;
      });
      if (sign < 0) corners.reverse();
      for (let i = 0; i < 4; i++)
        face(
          [corners[i], corners[(i + 1) % 4], tip].map((p) =>
            p.map((x, k) => x + center[k]),
          ),
        );
    }
  sphere("star.heart", center, [8, 8, 12], "light", 20);
  torus("star.inner.equator", center, 39, 0.45, "light");
  // Control dock on the front-left rim; service access and a usable hand wheel.
  box("dock.body", [-75, 103, 58], [62, 47, 18], "dark", 4);
  box("dock.face", [-75, 103, 68], [55, 40, 3], "brass", 1);
  disc("dock.dial", [-75, 103, 70], 17, 3, "black");
  torus("dock.dial.rim", [-75, 103, 73], 17, 1, "edge");
  for (let i = 0; i < 24; i++) {
    const a = (i * TAU) / 24;
    tube(
      "dial.tick." + i,
      [
        [-75 + 14 * Math.cos(a), 103 + 14 * Math.sin(a), 73.2],
        [-75 + 11 * Math.cos(a), 103 + 11 * Math.sin(a), 73.2],
      ],
      0.35,
      "brass",
    );
  }
  tube(
    "dial.needle",
    [
      [-75, 103, 74],
      [-65, 107, 74],
    ],
    0.6,
    "light",
  );
  for (const x of [-97, -53])
    for (const y of [88, 118]) screw("dock.screw", x, y, 70, 1.4);
  for (let i = 0; i < 3; i++) {
    disc(
      "dock.button." + i,
      [-50, 88 + i * 12, 72],
      3,
      2,
      i === 1 ? "light" : "black",
    );
  }
  // Recessed power-service covers, with vents bounded by their panel frames.
  for (const c of [
    [104, 75],
    [-110, -74],
  ]) {
    box("service.frame", [...c, 51], [36, 29, 3], "brass", 2);
    box("service.inset", [...c, 53], [32, 25, 2], "black", 1);
    for (let i = -3; i <= 3; i++)
      box(
        "service.louvre",
        [c[0] + i * 3.5, c[1], 54.5],
        [1.4, 18, 1],
        "steel",
        0.5,
      );
    for (const dx of [-14, 14])
      for (const dy of [-10, 10])
        screw("service.screw", c[0] + dx, c[1] + dy, 54, 1);
  }
  // Characters are meshes in this same world, sharing lighting and shadows.
  function hat(id, x, y, z, scale = 1) {
    // A curled fabric cone and warped brim, sampled as continuous surfaces.
    const mesh = (name, point, rows, steps) => {
      begin(name, "purple");
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < steps; j++) {
          const ids = [
              [i, j],
              [i + 1, j],
              [i + 1, j + 1],
              [i, j + 1],
            ],
            q = ids.map(([u, v]) => point(u / rows, (v * TAU) / steps)),
            n = ids.map(([u, v]) => {
              const t = Math.min(u / rows, 0.9998),
                a = (v * TAU) / steps,
                p = point(t, a),
                dt = point(t + 0.0001, a).map((x, k) => x - p[k]),
                da = point(t, a + 0.0001).map((x, k) => x - p[k]);
              return norm(cross(da, dt));
            });
          quad(q.reverse(), n.reverse());
        }
    };
    mesh(
      id + ".brim",
      (t, a) => {
        const r = 18 + 13 * t;
        return [
          x + scale * r * Math.cos(a),
          y + scale * r * Math.sin(a),
          z + scale * (2 + 2 * t * Math.sin(a * 2) + 1.5 * t * t),
        ];
      },
      6,
      96,
    );
    tube(
      id + ".brim.edge",
      Array.from({ length: 97 }, (_, i) => {
        const a = (i * TAU) / 96;
        return [
          x + scale * 31 * Math.cos(a),
          y + scale * 31 * Math.sin(a),
          z + scale * (3.5 + 2 * Math.sin(a * 2)),
        ];
      }),
      0.55 * scale,
      "purple",
    );
    mesh(
      id + ".cone",
      (t, a) => {
        const r = 21 * Math.pow(Math.max(0, 1 - t), 0.9),
          bend = 22 * t * t * t;
        return [
          x + scale * (bend + r * Math.cos(a)),
          y + scale * (r * Math.sin(a) - 4 * t * t),
          z + scale * (3 + 54 * t - 17 * t * t * t),
        ];
      },
      32,
      96,
    );
    lathe(
      id + ".band",
      [x, y, z + 5 * scale],
      [
        [0, 20.7 * scale],
        [6 * scale, 18.2 * scale],
      ],
      "brass",
      96,
    );
    box(
      id + ".buckle",
      [x + 12 * scale, y + 14 * scale, z + 9 * scale],
      [8 * scale, 3 * scale, 6 * scale],
      "edge",
      0.7,
    );
    box(
      id + ".buckle.inset",
      [x + 12 * scale, y + 15.6 * scale, z + 9 * scale],
      [4.5 * scale, 0.3 * scale, 3 * scale],
      "purple",
      0.3,
    );
  }
  // Original workshop meshes, transformed from Y-up/+Z-front into this scene.
  const u = [Math.SQRT1_2, -Math.SQRT1_2, 0],
    f = [Math.SQRT1_2, Math.SQRT1_2, 0];
  function imported(id, mesh, c, scale, material, legRow = null) {
    begin(id, material);
    const index =
      mesh.index ||
      Array.from({ length: mesh.position.length / 3 }, (_, i) => i);
    for (let t = 0; t < index.length; t += 3)
      for (const offset of [0, 2, 1]) {
        const i = index[t + offset] * 3,
          p = mesh.position.slice(i, i + 3),
          n = mesh.normal.slice(i, i + 3);
        if (legRow !== null) {
          p[2] = p[2] * 0.48 + (legRow ? 0.36 : -0.36);
          n[2] /= 0.48;
        }
        if (id.startsWith("Clawd")) {
          const a = 0.28,
            cs = Math.cos(a),
            sn = Math.sin(a);
          [p[0], p[2]] = [cs * p[0] + sn * p[2], -sn * p[0] + cs * p[2]];
          [n[0], n[2]] = [cs * n[0] + sn * n[2], -sn * n[0] + cs * n[2]];
        }
        const P = [
          c[0] + scale * (u[0] * p[0] + f[0] * p[2]),
          c[1] + scale * (u[1] * p[0] + f[1] * p[2]),
          c[2] + scale * p[1],
        ];
        vertex(
          P,
          norm([u[0] * n[0] + f[0] * n[2], u[1] * n[0] + f[1] * n[2], n[1]]),
        );
      }
  }
  const cx = -162,
    cy = 30,
    z = 49;
  const clawdMin = Math.min(
      ...moonModels.clawd.flatMap((m) =>
        m.position.filter((_, i) => i % 3 === 1),
      ),
    ),
    clawdMax = Math.max(
      ...moonModels.clawd.flatMap((m) =>
        m.position.filter((_, i) => i % 3 === 1),
      ),
    ),
    cs = 52 / (clawdMax - clawdMin),
    base = [cx, cy, z - clawdMin * cs];
  moonModels.clawd.forEach((m, i) => {
    const material =
      m.color === 0xd97757
        ? "moon-orange"
        : m.color === 0x2e3a5c
          ? "moon-eye"
          : "moon-white";
    if (m.leg >= 0)
      for (let row = 0; row < 2; row++)
        imported(`Clawd.leg.${row}.${m.leg}`, m, base, cs, material, row);
    else imported("Clawd.workshop." + i, m, base, cs, material);
  });
  hat("Clawd.hat", cx, cy, z + 51, 0.9);
  const px = cx + 24,
    py = cy + 8,
    pz = z + 73;
  tube(
    "Clawd.pumpkin.cord",
    [
      [cx + 23, cy - 3, z + 88],
      [px, py, pz + 6],
    ],
    0.35,
    "brass",
  );
  for (let i = 0; i < 6; i++) {
    const a = (i * TAU) / 6;
    sphere(
      "Clawd.pumpkin.lobe." + i,
      [px + 2 * Math.cos(a), py + 2 * Math.sin(a), pz],
      [3.5, 3.5, 5],
      "orange",
      16,
    );
  }
  box("Clawd.pumpkin.stem", [px, py, pz + 5], [1.6, 1.6, 3], "brass", 0.4);
  for (const dx of [-1.7, 1.7])
    box(
      "Clawd.pumpkin.eye",
      [px + dx, py + 5, pz + 1],
      [1.2, 0.3, 1.5],
      "black",
      0.1,
    );
  const g = gptPlacement;
  imported(
    "GPT.workshop.body",
    moonModels.gpt,
    [g.x, g.y, g.z],
    g.scale,
    "moon-gpt",
  );
  hat("GPT.hat", g.x, g.y, g.z + g.height - 5, 0.85);

  finish();
  return { groups, parts };
}
