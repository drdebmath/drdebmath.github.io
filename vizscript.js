// Combined and compacted vizscript.js and controlpanel.js

// Variable declarations
let cy, actions = [], currentStep = -1, nodeCount = 10, graphType = "random", 
    manualMode = false, manualActions = [], traversalAlgorithm = "dfs";

// Graph generation functions
function generateGraph(type, n) {
    const generators = {
        random: generateRandomGraph, tree: generateTree, rectangular: () => generateRectangularGrid(Math.ceil(Math.sqrt(n)), Math.floor(Math.sqrt(n))),
        triangular: () => generateTriangularGrid(Math.ceil(Math.sqrt(n))), hexagonal: generateHexagonalGrid, ring: generateRing,
        butterfly: generateButterfly, hypergraph: generateHypercubeGraph, bipartite: generateBipartiteGraph
    };
    return (generators[type] || generateRandomGraph)(n);
}

function generateTree(n) {
    const nodes = Array.from({ length: n }, (_, i) => ({ data: { id: `n${i}` } }));
    const edges = Array.from({ length: n - 1 }, (_, i) => ({ data: { id: `e${Math.floor(Math.random() * (i + 1))}-${i + 1}`, source: `n${Math.floor(Math.random() * (i + 1))}`, target: `n${i + 1}` } }));
    return { nodes, edges };
}

function generateRectangularGrid(rows, cols) {
    const nodes = [], edges = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
        const id = `n${i}-${j}`; nodes.push({ data: { id } });
        if (i > 0) edges.push({ data: { id: `e${i-1}-${j}-${i}-${j}`, source: `n${i-1}-${j}`, target: id } });
        if (j > 0) edges.push({ data: { id: `e${i}-${j-1}-${i}-${j}`, source: `n${i}-${j-1}`, target: id } });
    }
    return { nodes, edges };
}

function generateTriangularGrid(size) {
    const nodes = [], edges = [];
    for (let i = 0; i < size; i++) for (let j = 0; j <= i; j++) {
        const id = `n${i}-${j}`; nodes.push({ data: { id } });
        if (j > 0) edges.push({ data: { id: `e${i}-${j-1}-${i}-${j}`, source: `n${i}-${j-1}`, target: id } });
        if (i > 0 && j < i) edges.push({ data: { id: `e${i-1}-${j}-${i}-${j}`, source: `n${i-1}-${j}`, target: id } });
        if (i > 0 && j > 0) edges.push({ data: { id: `e${i-1}-${j-1}-${i}-${j}`, source: `n${i-1}-${j-1}`, target: id } });
    }
    return { nodes, edges };
}

function generateHexagonalGrid(n) {
    const nodes = [], edges = [], radius = Math.ceil((Math.sqrt(n) - 1) / 2), seen = new Set();
    for (let q = -radius; q <= radius && nodes.length < n; q++) for (let r = -radius; r <= radius && nodes.length < n; r++) {
        const s = -q - r; if (Math.abs(q) <= radius && Math.abs(r) <= radius && Math.abs(s) <= radius) {
            const id = `n${q},${r}`; nodes.push({ data: { id } }); seen.add(`${q},${r}`);
        }
    }
    nodes.forEach(node => {
        const [q, r] = node.data.id.replace("n", "").split(",").map(Number);
        [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]].forEach(([dq, dr]) => {
            const nq = q + dq, nr = r + dr, nid = `n${nq},${nr}`;
            if (seen.has(`${nq},${nr}`) && !edges.some(e => (e.data.source === node.data.id && e.data.target === nid) || (e.data.source === nid && e.data.target === node.data.id)))
                edges.push({ data: { id: `e${node.data.id}-${nid}`, source: node.data.id, target: nid } });
        });
    });
    return { nodes, edges: edges.slice(0, 3 * n) };
}

function generateRing(n) {
    const nodes = Array.from({ length: n }, (_, i) => ({ data: { id: `n${i}` } }));
    const edges = Array.from({ length: n }, (_, i) => ({ data: { id: `e${i}-${(i + 1) % n}`, source: `n${i}`, target: `n${(i + 1) % n}` } }));
    return { nodes, edges };
}

function generateButterfly(n) {
    n = Math.pow(2, Math.floor(Math.log2(n))); const levels = Math.log2(n), nodes = [], edges = [];
    for (let l = 0; l <= levels; l++) for (let i = 0; i < n; i++) nodes.push({ data: { id: `n${l}-${i}` } });
    for (let l = 0; l < levels; l++) for (let i = 0; i < n; i++) {
        edges.push({ data: { id: `e${l}-${i}-straight`, source: `n${l}-${i}`, target: `n${l+1}-${i}` } });
        edges.push({ data: { id: `e${l}-${i}-cross`, source: `n${l}-${i}`, target: `n${l+1}-${i ^ (1 << (levels-l-1))}` } });
    }
    return { nodes, edges };
}

function generateHypercubeGraph(n) {
    const dim = Math.ceil(Math.log2(n)), total = Math.pow(2, dim), nodes = [], edges = [];
    for (let i = 0; i < total; i++) nodes.push({ data: { id: `n${i}`, label: i.toString(2).padStart(dim, "0") } });
    for (let i = 0; i < total; i++) for (let j = 0; j < dim; j++) {
        const nid = i ^ (1 << j); if (nid > i) edges.push({ data: { id: `e${i}-${nid}`, source: `n${i}`, target: `n${nid}` } });
    }
    return { nodes, edges };
}

function generateBipartiteGraph(n) {
    const nodes = Array.from({ length: n }, (_, i) => ({ data: { id: `n${i}` } })), edges = [], p = Math.floor(n / 2);
    for (let i = 0; i < p; i++) for (let j = p; j < n; j++) if (Math.random() > 0.5) edges.push({ data: { id: `e${i}-${j}`, source: `n${i}`, target: `n${j}` } });
    return { nodes, edges };
}

function generateRandomGraph(n) {
    const nodes = Array.from({ length: n }, (_, i) => ({ data: { id: `n${i}` } })), edges = [], edgeSet = new Set();
    const addEdge = (s, t) => { if (s === t || edgeSet.has(`e${[s,t].sort().join("-")}`)) return false; 
        edges.push({ data: { id: `e${s}-${t}`, source: `n${s}`, target: `n${t}` } }); edgeSet.add(`e${[s,t].sort().join("-")}`); return true; };
    const connected = new Set([0]), unconnected = new Set(Array.from({ length: n - 1 }, (_, i) => i + 1));
    while (unconnected.size) { const s = [...connected][Math.floor(Math.random() * connected.size)], t = [...unconnected][Math.floor(Math.random() * unconnected.size)]; 
        addEdge(s, t); connected.add(t); unconnected.delete(t); }
    const maxExtra = Math.min(Math.floor(n * Math.log(n)), (n * (n - 1)) / 2 - (n - 1));
    for (let i = 0, added = 0; added < Math.floor(Math.random() * maxExtra) + 1 && i < maxExtra * 3; i++) if (addEdge(Math.floor(Math.random() * n), Math.floor(Math.random() * n))) added++;
    return { nodes, edges };
}

// Traversal and visualization functions
function assignPortNumbers() {
    cy.nodes().forEach(node => { const ports = Array.from({ length: node.degree(false) }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
        node.connectedEdges().forEach((edge, i) => edge.data(edge.source().id() === node.id() ? "sourcePort" : "targetPort", ports[i])); });
    cy.edges().style("line-color", "#ccc"); cy.style().update(); processActions(currentStep);
}

function computeTraversalActions() {
    traversalAlgorithm = document.getElementById("traversal-algorithm").value;
    actions = traversalAlgorithm === "dfs" ? computeDFSActions() : computeBFSActions();
    currentStep = -1; updateStepCounter(); updatePlayButtonText();
    return actions;
}

function computeDFSActions() {
    const visited = new Set(), actions = [], start = cy.nodes()[0];
    function runDFS(node, parent, edge) {
        visited.add(node.id()); if (parent) actions.push({ type: "move", from: parent, to: node.id(), edge });
        node.connectedEdges().forEach(e => { if (e.id() !== edge) { const n = e.target().id() === node.id() ? e.source() : e.target();
            if (!visited.has(n.id())) runDFS(n, node.id(), e.id()); else if (n.id() !== parent) actions.push({ type: "backEdge", edge: e.id(), from: node.id(), to: n.id() }); } });
        if (parent) actions.push({ type: "backtrack", from: node.id(), to: parent, edge });
    }
    runDFS(start, null, null); return actions;
}

function computeBFSActions() {
    const actions = [], start = cy.nodes()[0], bfsTree = buildBFSTree(start); runBFSWithAgent(start, bfsTree, actions); return actions;
}

function buildBFSTree(start) {
    const tree = new Map(), queue = [{ node: start, level: 0 }], visited = new Set([start.id()]);
    tree.set(start.id(), { parent: null, edgeToParent: null, level: 0, children: [] });
    while (queue.length) { const { node, level } = queue.shift(); node.connectedEdges().forEach(edge => {
        const n = edge.target().id() === node.id() ? edge.source() : edge.target(); if (!visited.has(n.id())) { visited.add(n.id());
            tree.set(n.id(), { parent: node.id(), edgeToParent: edge.id(), level: level + 1, children: [] }); tree.get(node.id()).children.push(n.id());
            queue.push({ node: n, level: level + 1 }); } }); }
    return tree;
}

function findPathInTree(source, target, tree) {
    if (source === target) return [];
    const p1 = [], p2 = []; let c = source; while (c) { p1.push(c); c = tree.get(c).parent; } c = target; while (c) { p2.push(c); c = tree.get(c).parent; }
    let lca, i = p1.length - 1, j = p2.length - 1; while (i >= 0 && j >= 0 && p1[i] === p2[j]) { lca = p1[i]; i--; j--; }
    const path = p1.slice(0, p1.indexOf(lca) + 1); for (let k = p2.indexOf(lca) - 1; k >= 0; k--) path.push(p2[k]); return path;
}

function getEdgeId(n1, n2) { const edge = cy.getElementById(n1).edgesWith(cy.getElementById(n2)); return edge.length ? edge[0].id() : null; }

function runBFSWithAgent(start, tree, actions) {
    const root = start.id(), visited = new Set([root]), discovered = new Set([root]), processed = new Set(); let pos = root;
    const levels = new Map([[0, [root]]]); tree.forEach((v, k) => { if (v.level) levels.set(v.level, (levels.get(v.level) || []).concat(k)); });
    const maxLevel = Math.max(...levels.keys());
    for (let l = 0; l <= maxLevel; l++) if (levels.has(l)) levels.get(l).forEach(node => {
        if (l === 0) discover(node); else { if (pos !== node) { const p = tree.get(node).parent, e = tree.get(node).edgeToParent;
            if (pos !== p) pos = move(pos, p, tree); actions.push({ type: processed.has(e) ? "traverse" : "move", from: p, to: node, edge: e, level: l });
            if (!processed.has(e)) processed.add(e); pos = node; } discover(node); const p = tree.get(node).parent, e = tree.get(node).edgeToParent;
            actions.push({ type: processed.has(e) ? "traverse" : "move", from: node, to: p, edge: e, level: l }); if (!processed.has(e)) processed.add(e); pos = p; }
    });
    function discover(node) { cy.getElementById(node).connectedEdges().forEach(edge => { const n = edge.target().id() === node ? edge.source() : edge.target(), nid = n.id();
        if (discovered.has(nid) && tree.get(nid).parent !== node && tree.get(node).parent !== nid && !processed.has(edge.id())) { 
            actions.push({ type: "backEdge", edge: edge.id(), from: node, to: nid, level: Math.max(tree.get(node).level, tree.get(nid).level) }); processed.add(edge.id()); }
        if (!discovered.has(nid)) discovered.add(nid); }); }
    function move(from, to) { const path = findPathInTree(from, to, tree); for (let i = 0; i < path.length - 1; i++) { const e = getEdgeId(path[i], path[i + 1]);
        actions.push({ type: processed.has(e) ? "traverse" : "move", from: path[i], to: path[i + 1], edge: e, level: Math.max(tree.get(path[i]).level, tree.get(path[i + 1]).level) });
        if (!processed.has(e)) processed.add(e); } return path[path.length - 1]; }
}

function updateGraph() {
    const graph = generateGraph(graphType, nodeCount), layout = graphType === "rectangular" ? { name: "grid", rows: Math.ceil(Math.sqrt(nodeCount)) } : { name: "cose", idealEdgeLength: 100, nodeRepulsion: 10000000 };
    cy = cytoscape({ container: document.getElementById("cy"), elements: [...graph.nodes, ...graph.edges], style: [
        { selector: "node", style: { "background-color": "gray", label: "data(id)", "text-valign": "center", "text-halign": "center", width: 40, height: 40 } },
        { selector: "edge", style: { width: 2, "line-color": "#ccc", "source-label": "data(sourcePort)", "target-label": "data(targetPort)", "source-text-offset": 40, "target-text-offset": 40,
            "text-background-color": "#fff", "text-background-opacity": 1, "text-background-shape": "roundrectangle", "text-background-padding": 3, "text-border-opacity": 1, "text-border-width": 1,
            "text-border-color": "#ddd", "z-index": 1, "text-background-height": 16, "text-background-width": 16 } },
        { selector: "edge.highlighted", style: { width: 4, "line-color": "#ffA500", "mid-target-arrow-color": "#ffA500", "line-style": "dashed" } }
    ], layout });
    cy.on("tap", "edge", e => { if (manualMode) { e.target.style("line-color", "red"); manualActions.push({ type: "edgeTap", edge: e.target.id() }); } });
    assignPortNumbers(); actions = computeTraversalActions(); currentStep = -1; processActions(-1);
}

function processActions(upToStep) {
    cy.edges().style("line-color", "#ccc").removeClass("highlighted"); cy.nodes().style("background-color", "gray");
    const start = cy.nodes()[0]; let pos = start.id();
    if (upToStep >= 0) { for (let i = 0; i <= upToStep; i++) { const a = actions[i];
        if (a.type === "move" || a.type === "backtrack") { cy.getElementById(a.edge).style("line-color", "green"); pos = a.to; }
        else if (a.type === "traverse") pos = a.to; else if (a.type === "backEdge") cy.getElementById(a.edge).style("line-color", "red"); }
        const ca = actions[upToStep]; if (ca && ca.edge) { cy.getElementById(ca.edge).addClass("highlighted"); if (ca.to) cy.getElementById(ca.to).style("background-color", "orange"); }
        cy.getElementById(pos).style("background-color", "red"); } else start.style("background-color", "red");
}

function undoLastAction() { if (manualActions.length) { const a = manualActions.pop(); if (a.type === "edgeTap") cy.getElementById(a.edge).style("line-color", "#ccc"); } }
function resetTraversal() { currentStep = -1; processActions(-1); updatePlayButtonText(); updateStepCounter(); }
function updatePlayButtonText() { document.getElementById("play-animation").textContent = currentStep === -1 || currentStep >= actions.length - 1 ? "Start Traversal" : "Restart Traversal"; }
function updateStepCounter() { document.getElementById("step-counter").textContent = `${currentStep + 1 > 0 ? currentStep + 1 : 0} / ${actions.length}`; }

// Control panel creation functions
function createElement(tag, props = {}) {
    const el = document.createElement(tag); Object.entries(props).forEach(([k, v]) => k === "className" ? el.className = v : k === "textContent" ? el.textContent = v : el.setAttribute(k, v)); return el;
}

function createButton(id, text, extra = "") {
    return createElement("button", { id, textContent: text, className: `bg-blue-500 text-white border border-blue-600 rounded-md py-1 px-2 cursor-pointer text-xs transition-all duration-200 shadow-sm hover:bg-blue-600 hover:shadow hover:-translate-y-0.5 active:bg-blue-700 active:translate-y-0.5 dark:bg-blue-600 dark:border-blue-700 dark:hover:bg-blue-700 ${extra}` });
}

function createSelect(id, options, extra = "") {
    const sel = createElement("select", { id, className: `p-1 rounded-md border border-gray-300 flex-grow min-w-[150px] text-sm md:text-base dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 ${extra}` });
    options.forEach(([v, t]) => sel.appendChild(createElement("option", { value: v, textContent: t }))); return sel;
}

function createLabel(forId, text, extra = "") {
    return createElement("label", { htmlFor: forId, textContent: text, className: `text-sm md:text-base ${extra}` });
}

function createControlPanel() {
    const cont = document.getElementById("control-panel"), main = createElement("div", { className: "my-3 flex flex-col gap-2 p-3 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600" });
    const r1 = createElement("div", { className: "flex flex-wrap items-center gap-2 w-full" });
    r1.append(createLabel("graph-type", "Graph Type:"), createSelect("graph-type", [["random","Random Graph"],["tree","Tree"],["rectangular","Rectangular Grid"],["triangular","Triangular Grid"],["hexagonal","Hexagonal Grid (Max Degree 3)"],["ring","Ring"],["butterfly","Butterfly"],["hypergraph","Hypercube Graph"],["bipartite","Bipartite Graph"]]), createButton("randomize-ports", "Randomize Ports", "mt-1 sm:mt-0"));
    const r2 = createElement("div", { className: "flex flex-wrap items-center gap-2 w-full" }), l2 = createLabel("node-slider", "Number of Nodes: "); l2.append(createElement("span", { id: "node-count", textContent: "10" }));
    r2.append(l2, createElement("input", { type: "range", id: "node-slider", min: "2", max: "50", value: "10", className: "flex-grow" }));
    const r3 = createElement("div", { className: "flex flex-wrap items-center gap-2 w-full" });
    r3.append(createLabel("traversal-algorithm", "Traversal Algorithm:"), createSelect("traversal-algorithm", [["dfs","Depth-First Search (DFS)"],["bfs","Breadth-First Search (BFS)"]]));
    const step = createElement("div", { className: "flex items-center justify-between w-full bg-gray-200 dark:bg-gray-800 rounded-md p-2" });
    step.append(createElement("span", { textContent: "Traversal Step:", className: "text-sm font-medium" }), createElement("span", { id: "step-counter", textContent: "0 / 0", className: "bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-bold" }));
    const r4 = createElement("div", { className: "flex flex-wrap gap-1 w-full justify-between" });
    ["prev-step:Previous Step","play-animation:Start Traversal","next-step:Next Step"].forEach(b => { const [id, text] = b.split(":"); r4.append(createButton(id, text, "flex-1 min-w-[30%] sm:min-w-0")); });
    const r5 = createElement("div", { className: "flex flex-wrap gap-1 w-full" });
    ["manual-mode:Manual Mode","undo:Undo"].forEach(b => { const [id, text] = b.split(":"); r5.append(createButton(id, text, "flex-1 min-w-[48%] sm:min-w-0")); });
    main.append(r1, r2, r3, step, r4, r5); cont.appendChild(main);
}

// Event listeners
function setupEventListeners() {
    document.getElementById("graph-type").addEventListener("change", e => { graphType = e.target.value; updateGraph(); });
    document.getElementById("node-slider").addEventListener("input", e => { nodeCount = parseInt(e.target.value); document.getElementById("node-count").textContent = nodeCount; updateGraph(); });
    document.getElementById("traversal-algorithm").addEventListener("change", e => { traversalAlgorithm = e.target.value; updateGraph(); });
    document.getElementById("randomize-ports").addEventListener("click", () => { assignPortNumbers(); resetTraversal(); });
    document.getElementById("next-step").addEventListener("click", () => { if (currentStep < actions.length - 1) { currentStep++; processActions(currentStep); updateStepCounter(); updatePlayButtonText(); } });
    document.getElementById("prev-step").addEventListener("click", () => { if (currentStep > -1) { currentStep--; processActions(currentStep); updateStepCounter(); updatePlayButtonText(); } });
    document.getElementById("play-animation").addEventListener("click", () => { if (currentStep > -1 && currentStep < actions.length - 1) return resetTraversal();
        let i = -1; const int = setInterval(() => { if (i < actions.length - 1) { i++; processActions(i); currentStep = i; updateStepCounter(); updatePlayButtonText(); } else clearInterval(int); }, 700); });
    document.getElementById("manual-mode").addEventListener("click", function() { manualMode = !manualMode; this.textContent = manualMode ? "Exit Manual Mode" : "Manual Mode"; if (!manualMode) assignPortNumbers(); });
    document.getElementById("undo").addEventListener("click", undoLastAction);
}

// Initialization
document.addEventListener("DOMContentLoaded", () => { createControlPanel(); setupEventListeners(); updateGraph(); updateStepCounter(); updatePlayButtonText(); });