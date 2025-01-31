const emoji = "🚂";
const domain = "arewedown.com";
const backup = Deno.env.get("CL_ARE_BACKUP");
const dt = new Date();
const tss = dt.toISOString().replaceAll(":", "").replaceAll("-", "").replaceAll(
  ".",
  "",
);
import * as base64 from "byte-base64";
import { fpng } from "fpng";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
const graphviz = await Graphviz.load();
const site = {};
const triples = Deno.readTextFileSync("assets/triples.txt");
const lines = triples.split("\n");
const dot = new Set();
const nodes = {};
for (const i of lines) {
  const a = i.split("🔹");
  if (a[1] == "🏷️") {
    nodes[a[0]] = nodes[a[0]] || {};
    nodes[a[0]].label = a[2];
  }
  if (a[1] == "🖼️") {
    nodes[a[0]] = nodes[a[0]] || {};
    nodes[a[0]].png = a[2];
  }
  if (a[1] == "🔖") {
    nodes[a[0]] = nodes[a[0]] || {};
    nodes[a[0]].icons = nodes[a[0]].icons || {};
    nodes[a[0]].icons[a[2]] = {};
  }
}
site.nodes = nodes;
for (const i of lines) {
  const a = i.split("🔹");
  if (a[1] == "↔️" || a[1] == "🧍") {
    dot.add(`"${a[0]}" -- "${a[2]}"`);
    dot.add(`"${a[0]}" [id="${a[0]}"]`);
    dot.add(`"${a[2]}" [id="${a[2]}"]`);
  }
}
site.svg = graphviz.dot(
  `graph{rankdir="LR"\ngraph [id="main_graph" splines=false] \nedge [minlen="5"]\nnode [imagescale=true width=1 height=3 penwidth=0 shape="octagon" label=""]
  ${[...dot].join("\n")}}`,
);
site.page = Deno.readTextFileSync("assets/page.html");
site.css = Deno.readTextFileSync("assets/style.css");
const st = JSON.stringify(site);
Deno.writeTextFileSync("site.txt", `let site=${st}\n`);
const text = Deno.readTextFileSync("site.txt") +
  Deno.readTextFileSync("dist/app.bundle.js");
function arr_to_hex(u8arr) {
  return `${
    Array.from(u8arr, (i) => i.toString(16).padStart(2, "0")).join("")
  }`;
}
const last_hash = Deno.readTextFileSync("data_sha512.txt");
const cur_hash = arr_to_hex(
  new Uint8Array(
    await crypto.subtle.digest("SHA-512", new TextEncoder().encode(text)),
  ),
);
if (last_hash.trim() != cur_hash.trim()) {
  Deno.writeTextFileSync("data_sha512.txt", cur_hash);
  const fp_obj = fpng(` Verify sig at floppypng.com - ${tss}`, text);
  const a32h = arr_to_hex(fp_obj.im.slice(-20, -16));
  console.log(`Generated FloppyPNG Size=${fp_obj.ln}`);

  const priv = Deno.readTextFileSync(Deno.env.get("CL_PRIV")).replace(
    /.*KEY-----(.+?)-----END.*/smg,
    "$1",
  );
  const b_der_str = globalThis.atob(priv);
  const b_der = Uint8Array.from([...b_der_str].map((c) =>
    c.charCodeAt()
  )).buffer;
  const prv = await globalThis.crypto.subtle.importKey(
    "pkcs8",
    b_der,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    {
      name: "RSA-PSS",
      hash: "SHA-256",
      saltLength: 32,
    },
    prv,
    fp_obj.im,
  );
  const u8sig = new Uint8Array(sig);
  const pages = ["html", "local.html"];
  Deno.writeFileSync(`${tss}-${a32h}.png`, fp_obj.im);
  Deno.writeTextFileSync(`${tss}-${a32h}.txt`, base64.bytesToBase64(u8sig));
  Deno.writeFileSync(`${backup}${tss}-${a32h}.png`, fp_obj.im);
  for await (const i of Deno.readDir("./")) {
    if (
      i.name != `${tss}-${a32h}.png` &&
      i.name.match(/^\d{8}T\d{9}Z\-\w{8}.png$/)
    ) {
      console.log(`removing ${i.name}`);
      Deno.remove(i.name);
    }
    if (
      i.name != `${tss}-${a32h}.txt` &&
      i.name.match(/^\d{8}T\d{9}Z\-\w{8}.txt$/)
    ) {
      console.log(`removing ${i.name}`);
      Deno.remove(i.name);
    }
  }
  for (const i of pages) {
    console.log(`${tss}-${a32h}`);
    Deno.writeTextFileSync(
      `${domain}.page.${i}`,
      Deno.readTextFileSync(`assets/pageops.${i}`)
        .replaceAll("thisistss", tss)
        .replaceAll("thisisadler", a32h)
        .replaceAll("thisisemoji", emoji)
        .replaceAll("thisistextlength", st.length)
        .replaceAll("thisislength", fp_obj.ln),
    );
  }
}
function web_deal(req) {
  if (req.method == "GET") {
    const u = new URL(req.url);
    const page = u.pathname == "/"
      ? `${domain}.page.local.html`
      : u.pathname.replace("/", "");
    let npg;
    let response;
    try {
      console.log(page);
      npg = Deno.readFileSync(page);
      const type = page.split(".").slice(-1);
      response = new Response(npg, {
        status: 200,
        headers: {
          "content-type": types[type],
        },
      });
    } catch {
      console.log("error 404");
      response = new Response(npg, {
        status: 404,
        headers: {
          "content-type": "text/plain;charset=utf-8",
        },
      });
    }
    return response;
  }
}
const types = {
  "js": "text/javascript;charset=utf-8",
  "mjs": "text/javascript;charset=utf-8",
  "css": "text/css",
  "svg": "image/svg+xml",
  "html": "text/html",
  "map": "application/json",
  "json": "application/json",
  "xz": "application/gzip",
  "png": "image/png",
  "zst": "application/zstd",
  "txt": "text/plain",
  "jpg": "image/jpg",
  "gif": "image/gif",
  "WebM": "video/webm",
  "mp4": "video/mp4",
  "mpg": "video/mp4",
  "webm": "video/webm",
  "ico": "image/x-icon",
};
Deno.serve({
  port: 3052,
  hostname: "0.0.0.0",
  handler: (req) => web_deal(req),
});
