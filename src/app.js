import * as d3 from "d3";
const style = document.createElement("style");
style.textContent = site.css;
document.head.appendChild(style);
document.body.insertAdjacentHTML("beforeend", site.page);
key.innerHTML = `<table><tr>
<td><img src="data:image/png;base64,` + site.nodes["🚂"].png +
  `"/></td><td>Machine Shop</td>` +
  `<td><img src="data:image/png;base64,` + site.nodes["🏢"].png +
  `"/></td><td>Division Office</td>` +
  `<td><img src="data:image/png;base64,` + site.nodes["🚦"].png +
  `"/></td><td>Flag and Switch Personell</td>` +
  `<tr><td><img src="data:image/png;base64,` + site.nodes["🛠"].png +
  `"/></td><td>Repair Shop</td>` +
  `<td><img src="data:image/png;base64,` + site.nodes["☎️"].png +
  `"/></td><td>Telegraph Station</td>` +
  `<td><img src="data:image/png;base64,` + site.nodes["🍴"].png +
  `"/></td><td>Eating and Saloon</td></table>`;
document.getElementById("graph").innerHTML = site.svg;
const gr = d3.select("#graph svg");
const zoom = d3.zoom()
  .on("zoom", zoomed);
function zoomed(e) {
  gr.attr("transform", e.transform);
}
d3.select("#graph").call(zoom);
gr.selectAll(".node")
  .each(function () {
    const node = d3.select(this);
    nid = node.attr("id");
    const bbox = node.node().getBBox();
    node.append("image")
      .attr(
        "xlink:href",
        `data:image/png;base64,${site.nodes[nid.split("🔸")[0]].png}`,
      )
      .attr("x", bbox.x + 1)
      .attr("y", bbox.y + 55)
      .attr("width", "50")
      .attr("height", "40");
    const lines = site.nodes[nid].label.split("\\n");
    for (let i = 0; i < lines.length; i++) {
      node.append("text")
        .attr("dx", bbox.x - 5)
        .attr("dy", bbox.y + i * 15 - 5)
        .text(lines[i]);
    }
    if (site.nodes[nid]?.icons) {
      const lines = Object.keys(site.nodes[nid].icons);
      for (let j = 0; j < lines.length; j++) {
        ang = (j * Math.PI + 3 * Math.PI / 2) / 3.85;
        node.append("image")
          .attr(
            "xlink:href",
            `data:image/png;base64,${site.nodes[lines[j]].png}`,
          )
          .attr("x", bbox.x + 60 * Math.cos(ang))
          .attr("y", bbox.y + 55 + 60 * Math.sin(ang))
          .attr("width", "50")
          .attr("height", "40");
      }
    }
  });
document.getElementById("lc").addEventListener("click",() =>{
   document.getElementById("legal").style.display="block";
   document.getElementById("graph").style.display="none";
   document.getElementById("key").style.display="none";
})
document.getElementById("gr").addEventListener("click",() =>{
   document.getElementById("legal").style.display="none";
   document.getElementById("graph").style.display="block";
   document.getElementById("key").style.display="block";
})