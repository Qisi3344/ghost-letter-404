// Copyright (c) 2026 绮思 (Qisi3344). All rights reserved.
// Reused in this project at the owner's explicit request. See docs/MOONTIDE_MODELS.md.
const moontideKnot = "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z";
function makeClawd() {
  var BODY = [[87,640],[858,640],[858,830],[945,830],[945,1010],[864,1010],[864,1215],[81,1215],[81,1010],[0,1010],[0,830],[87,830]];
  var LEGS = [[81,171],[256,346],[597,687],[774,864]];
  function V(p) { return new THREE.Vector2((p[0] - 472.5) / 200, (1405 - p[1]) / 200); } // feet at y=0
  function rshape(pts, r) {
    var s = new THREE.Shape(), n = pts.length;
    for (var i = 0; i < n; i++) {
      var p = pts[i], pr = pts[(i - 1 + n) % n], nx = pts[(i + 1) % n];
      var d1 = pr.clone().sub(p), d2 = nx.clone().sub(p), rr = Math.min(r, d1.length() / 2, d2.length() / 2);
      var a = p.clone().add(d1.normalize().multiplyScalar(rr)), b = p.clone().add(d2.normalize().multiplyScalar(rr));
      if (i === 0) s.moveTo(a.x, a.y); else s.lineTo(a.x, a.y);
      s.quadraticCurveTo(p.x, p.y, b.x, b.y);
    }
    return s;
  }
  function ext(pts, depth, bev) {
    var g = new THREE.ExtrudeGeometry(rshape(pts.map(V), 0.14), { depth: depth, bevelEnabled: true, bevelThickness: bev, bevelSize: 0.16, bevelSegments: 4, curveSegments: 3 });
    g.translate(0, 0.16, -depth / 2); g.computeVertexNormals(); return g;
  }
  var bodyM = toonMat(0xD97757);
  var g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  var bodyG = new THREE.Group(); inner.add(bodyG);               // bobs while walking
  var body = new THREE.Mesh(ext(BODY, 1.0, 0.24), bodyM); body.castShadow = true; bodyG.add(body);
  var eyeM = toonMat(0x2e3a5c); // deep indigo, never black
  var hiM = new THREE.MeshBasicMaterial({ color: lc(0xfbfdff) }); // unlit: stays bright day and night
  var EY = 0.16 + 2.775;
  var eyes = [], smile = new THREE.Group(); smile.visible = false; bodyG.add(smile);
  [-1.12, 1.12].forEach(function (x) {
    var e = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.9, 0.08), eyeM); e.position.set(x, EY, 0.76); bodyG.add(e);
    var h = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.19), hiM); h.position.set(x - 0.08, EY + 0.25, 0.805); bodyG.add(h); // one catch-light, top-left
    eyes.push(e, h);
    // happy eyes ^ ^ : a little arch in the same indigo, shown instead while smiling
    var arc = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.075, 6, 14, Math.PI), eyeM); arc.position.set(x, EY - 0.12, 0.79); smile.add(arc);
  });
  var legs = LEGS.map(function (L, k) {
    var piv = new THREE.Group(); piv.position.set(((L[0] + L[1]) / 2 - 472.5) / 200, (1405 - 1195) / 200 + 0.16, 0); inner.add(piv);
    var m = new THREE.Mesh(ext([[L[0], 1195], [L[1], 1195], [L[1], 1405], [L[0], 1405]], 0.8, 0.2), bodyM);
    m.position.set(-piv.position.x, -piv.position.y, 0); m.castShadow = true; piv.add(m);
    return piv;
  });
  inner.scale.setScalar(1 / 4.15); // native height ~4.15 -> 1 unit; outer g.scale = height in island units
  g.userData = { bodyG: bodyG, legs: legs, eyes: eyes, smile: smile };
  return g;
}

function buildXiaoG(THREE){
  var GS = 1.25; // same 1.25 scale the plush used
  function sdEll(x, y, z, rx, ry, rz) {
    var a = Math.sqrt(x * x / (rx * rx) + y * y / (ry * ry) + z * z / (rz * rz));
    var b = Math.sqrt(x * x / (rx * rx * rx * rx) + y * y / (ry * ry * ry * ry) + z * z / (rz * rz * rz * rz)) || 1e-6;
    return a * (a - 1) / b;
  }
  function smin(a, b, k) { var h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
  function parts(x, y, z) {
    var d = sdEll(x - 0.03, y - 0.62, z, 1.42, 1.25, 1.08);          // big soft head
    d = smin(d, sdEll(x, y + 0.85, z, 0.78, 0.8, 0.66), 0.32);        // little body
    for (var s = -1; s <= 1; s += 2) {
      var ax = x - s * 0.82, ay = y + 0.72, a = s * 0.9, c = Math.cos(a), sn = Math.sin(a);
      d = smin(d, sdEll(ax * c + ay * sn, -ax * sn + ay * c, z - 0.04, 0.33, 0.24, 0.26), 0.16); // stubby arms
      d = smin(d, sdEll(x - s * 0.3, y + 1.62, z - 0.04, 0.3, 0.3, 0.32), 0.14);                  // feet
    }
    return d;
  }
  // separate part distances (torso = head+body, then feet L/R, arms L/R) → skin weights
  function partD(x, y, z) {
    var t = smin(sdEll(x - 0.03, y - 0.62, z, 1.42, 1.25, 1.08), sdEll(x, y + 0.85, z, 0.78, 0.8, 0.66), 0.32), out = [t];
    for (var s = -1; s <= 1; s += 2) out.push(sdEll(x - s * 0.3, y + 1.62, z - 0.04, 0.3, 0.3, 0.32));
    for (s = -1; s <= 1; s += 2) {
      var ax = x - s * 0.82, ay = y + 0.72, a = s * 0.9, c = Math.cos(a), sn = Math.sin(a);
      out.push(sdEll(ax * c + ay * sn, -ax * sn + ay * c, z - 0.04, 0.33, 0.24, 0.26));
    }
    return out; // [torso, footL, footR, armL, armR]
  }
  function sdf(x, y, z) { return parts(x / GS, y / GS, z / GS) * GS; }

  // surface nets mesher (same idea as the plush build, without particles / fur)
  function mesh() {
    var B = [-1.75, -2.2, -1.3, 3.5, 4.3, 2.6], h = 0.06 * GS;
    var x0 = B[0] * GS, y0 = B[1] * GS, z0 = B[2] * GS;
    var nx = Math.ceil(B[3] * GS / h) + 1, ny = Math.ceil(B[4] * GS / h) + 1, nz = Math.ceil(B[5] * GS / h) + 1;
    var F = new Float32Array(nx * ny * nz), i, j, k;
    function id(i, j, k) { return (k * ny + j) * nx + i; }
    for (k = 0; k < nz; k++) for (j = 0; j < ny; j++) for (i = 0; i < nx; i++) F[id(i, j, k)] = sdf(x0 + i * h, y0 + j * h, z0 + k * h);
    var vid = new Int32Array((nx - 1) * (ny - 1) * (nz - 1)).fill(-1), V = [];
    function cid(i, j, k) { return (k * (ny - 1) + j) * (nx - 1) + i; }
    var CE = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
    for (k = 0; k < nz - 1; k++) for (j = 0; j < ny - 1; j++) for (i = 0; i < nx - 1; i++) {
      var c = [], m = 0, q;
      for (q = 0; q < 8; q++) { var v = F[id(i + (q & 1), j + ((q >> 1) & 1), k + ((q >> 2) & 1))]; c.push(v); if (v < 0) m |= 1 << q; }
      if (m === 0 || m === 255) continue;
      var sx = 0, sy = 0, sz = 0, ne = 0;
      for (var e = 0; e < 12; e++) {
        var a0 = CE[e][0], b0 = CE[e][1]; if ((c[a0] < 0) === (c[b0] < 0)) continue;
        var t = c[a0] / (c[a0] - c[b0]);
        sx += (a0 & 1) + ((b0 & 1) - (a0 & 1)) * t; sy += ((a0 >> 1) & 1) + (((b0 >> 1) & 1) - ((a0 >> 1) & 1)) * t; sz += ((a0 >> 2) & 1) + (((b0 >> 2) & 1) - ((a0 >> 2) & 1)) * t; ne++;
      }
      vid[cid(i, j, k)] = V.length / 3;
      V.push(x0 + (i + sx / ne) * h, y0 + (j + sy / ne) * h, z0 + (k + sz / ne) * h);
    }
    var I = [];
    function quad(a, b, cc, d, ax, inside) {
      if (a < 0 || b < 0 || cc < 0 || d < 0) return;
      var ux = V[cc * 3] - V[a * 3], uy = V[cc * 3 + 1] - V[a * 3 + 1], uz = V[cc * 3 + 2] - V[a * 3 + 2];
      var wx = V[d * 3] - V[b * 3], wy = V[d * 3 + 1] - V[b * 3 + 1], wz = V[d * 3 + 2] - V[b * 3 + 2];
      var n = ax === 0 ? uy * wz - uz * wy : ax === 1 ? uz * wx - ux * wz : ux * wy - uy * wx;
      if (n * (inside ? 1 : -1) < 0) I.push(a, d, cc, a, cc, b); else I.push(a, b, cc, a, cc, d);
    }
    for (k = 1; k < nz - 1; k++) for (j = 1; j < ny - 1; j++) for (i = 1; i < nx - 1; i++) {
      var f0 = F[id(i, j, k)] < 0;
      if (f0 !== (F[id(i + 1, j, k)] < 0)) quad(vid[cid(i, j - 1, k - 1)], vid[cid(i, j, k - 1)], vid[cid(i, j, k)], vid[cid(i, j - 1, k)], 0, f0);
      if (f0 !== (F[id(i, j + 1, k)] < 0)) quad(vid[cid(i - 1, j, k - 1)], vid[cid(i, j, k - 1)], vid[cid(i, j, k)], vid[cid(i - 1, j, k)], 1, f0);
      if (f0 !== (F[id(i, j, k + 1)] < 0)) quad(vid[cid(i - 1, j - 1, k)], vid[cid(i, j - 1, k)], vid[cid(i, j, k)], vid[cid(i - 1, j, k)], 2, f0);
    }
    // snap onto the true surface, smooth normals from the field
    var nv = V.length / 3, N = new Float32Array(nv * 3), e2 = 0.012, mnY = 1e9, mxY = -1e9;
    function grad(x, y, z) {
      var gx = sdf(x + e2, y, z) - sdf(x - e2, y, z), gy = sdf(x, y + e2, z) - sdf(x, y - e2, z), gz = sdf(x, y, z + e2) - sdf(x, y, z - e2), l = Math.sqrt(gx * gx + gy * gy + gz * gz) || 1;
      return [gx / l, gy / l, gz / l];
    }
    for (i = 0; i < nv; i++) {
      var px = V[i * 3], py = V[i * 3 + 1], pz = V[i * 3 + 2];
      for (var it = 0; it < 2; it++) { var d0 = sdf(px, py, pz), g = grad(px, py, pz); px -= g[0] * d0; py -= g[1] * d0; pz -= g[2] * d0; }
      V[i * 3] = px; V[i * 3 + 1] = py; V[i * 3 + 2] = pz; mnY = Math.min(mnY, py); mxY = Math.max(mxY, py);
      var nn = grad(px, py, pz); N[i * 3] = nn[0]; N[i * 3 + 1] = nn[1]; N[i * 3 + 2] = nn[2];
    }
    // skin: bones 0 root, 1 torso, 2/3 feet, 4/5 arms — soft weights from how close each part is
    var SI = new Uint16Array(nv * 4), SW = new Float32Array(nv * 4);
    for (i = 0; i < nv; i++) {
      var pd = partD(V[i * 3] / GS, V[i * 3 + 1] / GS, V[i * 3 + 2] / GS), w = [], tot = 0;
      for (var b = 0; b < 5; b++) { var ww = Math.exp(-Math.max(pd[b], -0.02) * 22); w.push(ww); tot += ww; }
      var ord = [0, 1, 2, 3, 4].sort(function (p, q) { return w[q] - w[p]; }), t4 = w[ord[0]] + w[ord[1]] + w[ord[2]] + w[ord[3]];
      for (b = 0; b < 4; b++) { SI[i * 4 + b] = ord[b] + 1; SW[i * 4 + b] = w[ord[b]] / t4; }
    }
    for (i = 1; i < V.length; i += 3) V[i] -= mnY; // feet on y = 0
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(V), 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(N, 3));
    geo.setAttribute("skinIndex", new THREE.Uint16BufferAttribute(SI, 4));
    geo.setAttribute("skinWeight", new THREE.Float32BufferAttribute(SW, 4));
    geo.setIndex(I);
    return { geo: geo, height: mxY - mnY, dy: -mnY };
  }


return mesh();
}
