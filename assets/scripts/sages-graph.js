/**
 * SagesGraph — D3.js SVG graph rendering for Talmudic Sages.
 *
 * Renders a chronological chart with:
 * - Y-axis: generations (top to bottom)
 * - X-axis: geography (Bavel left, Israel right)
 * - Historical landmark bands
 * - Nodes: rounded rects with sage names
 * - Edges: styled by relationship type
 *
 * Usage:
 *   const graph = new SagesGraph(containerEl, sagesData);
 *   graph.render();
 *   graph.onNodeClick = (sageId) => { ... };
 */

class SagesGraph {
  constructor(container, sagesData) {
    this.container = container;
    this.data = sagesData;
    this.svg = null;
    this.zoomGroup = null;
    this.zoom = null;
    this.onNodeClick = null; // callback

    // Layout constants
    this.NODE_WIDTH = 140;
    this.NODE_HEIGHT = 44;
    this.NODE_GAP = 12;
    this.NODES_PER_SUBROW = 5;
    this.ROW_HEIGHT = 70;
    this.COLUMN_GAP = 40;
    this.PADDING = { top: 40, right: 30, bottom: 30, left: 30 };
    this.LANDMARK_HEIGHT = 24;

    // Node positions cache: id -> {x, y}
    this._positions = new Map();

    // Current filter state — sets of active groups
    this._activeGroups = new Set(["tanna"]);
    this._activeRelTypes = new Set(["teacher-student", "family", "sibling"]);

    // Currently selected sage
    this._selectedId = null;
  }

  render() {
    this._calculateLayout();
    this._createSVG();
    this._drawLandmarks();
    this._drawEdges();
    this._drawNodes();
    this._setupZoom();
  }

  _calculateLayout() {
    // Group sages by generation+location
    const bands = new Map(); // "tanna-3-israel" -> [sage, ...]
    const sages = this._getFilteredSages();

    for (const sage of sages) {
      const key = `${sage.era}-${sage.generation}-${sage.location}`;
      if (!bands.has(key)) bands.set(key, []);
      bands.get(key).push(sage);
    }

    // Sort within each band by birth year, then alphabetically
    for (const [, group] of bands) {
      group.sort((a, b) => {
        const dateA = a.dates?.born ?? 0;
        const dateB = b.dates?.born ?? 0;
        if (dateA !== dateB) return dateA - dateB;
        return a.name.en.localeCompare(b.name.en);
      });
    }

    // Calculate row Y positions
    // Tannaim generations 1-5, then Amoraim 1-7
    const rows = [];
    for (let g = 1; g <= 5; g++) rows.push({ era: "tanna", generation: g });
    for (let g = 1; g <= 7; g++) rows.push({ era: "amorai", generation: g });

    let currentY = this.PADDING.top;

    // Check if any landmark falls near this generation's time period
    // and add extra space for it
    for (const row of rows) {
      row.y = currentY;

      // Count sages in this row (both columns)
      const israelKey = `${row.era}-${row.generation}-israel`;
      const bavelKey = `${row.era}-${row.generation}-bavel`;
      const israelCount = bands.get(israelKey)?.length || 0;
      const bavelCount = bands.get(bavelKey)?.length || 0;
      const maxInRow = Math.max(israelCount, bavelCount, 1);

      // If many sages in one cell, expand the row height
      const cellRows = Math.ceil(maxInRow / this.NODES_PER_SUBROW);
      currentY += Math.max(this.ROW_HEIGHT, cellRows * (this.NODE_HEIGHT + this.NODE_GAP)) + 8;
    }

    this._totalHeight = currentY + this.PADDING.bottom;

    // Calculate column X positions — independent widths per geographic column
    let maxBavel = 1, maxIsrael = 1;
    for (const [key, group] of bands) {
      const nodesPerRow = Math.min(group.length, this.NODES_PER_SUBROW);
      if (key.endsWith("-bavel")) maxBavel = Math.max(maxBavel, nodesPerRow);
      if (key.endsWith("-israel")) maxIsrael = Math.max(maxIsrael, nodesPerRow);
    }
    const bavelWidth = Math.max(maxBavel * (this.NODE_WIDTH + this.NODE_GAP), 300);
    const israelWidth = Math.max(maxIsrael * (this.NODE_WIDTH + this.NODE_GAP), 300);

    this._bavelX = this.PADDING.left;
    this._israelX = this.PADDING.left + bavelWidth + this.COLUMN_GAP;
    this._totalWidth = this._israelX + israelWidth + this.PADDING.right;
    this._dividerX = this.PADDING.left + bavelWidth + this.COLUMN_GAP / 2;

    // Position each sage node
    for (const row of rows) {
      for (const loc of ["bavel", "israel"]) {
        const key = `${row.era}-${row.generation}-${loc}`;
        const group = bands.get(key) || [];
        const baseX = loc === "bavel" ? this._bavelX : this._israelX;

        for (let i = 0; i < group.length; i++) {
          const sage = group[i];
          const subRow = Math.floor(i / this.NODES_PER_SUBROW);
          const subCol = i % this.NODES_PER_SUBROW;
          const x = baseX + subCol * (this.NODE_WIDTH + this.NODE_GAP);
          const y = row.y + subRow * (this.NODE_HEIGHT + this.NODE_GAP);
          this._positions.set(sage.id, { x, y });
        }
      }
    }

    this._rows = rows;
  }

  _getFilteredSages() {
    return this.data.sages.filter(s => {
      const group = s.era === "tanna" ? "tanna" : `amorai-${s.location}`;
      return this._activeGroups.has(group);
    });
  }

  _createSVG() {
    // Clear existing
    this.container.replaceChildren();

    this.svg = d3.select(this.container)
      .append("svg")
      .attr("class", "sages-graph-svg")
      .attr("width", "100%")
      .attr("height", "100%");

    this.zoomGroup = this.svg.append("g").attr("class", "zoom-group");

    // Arrow marker definitions for directed edges
    const defs = this.svg.append("defs");
    defs.append("marker")
      .attr("id", "arrow-teacher")
      .attr("viewBox", "0 0 10 10")
      .attr("refX", 10)
      .attr("refY", 5)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto-start-reverse")
      .append("path")
      .attr("d", "M 0 0 L 10 5 L 0 10 z")
      .attr("fill", "#7c3aff");
  }

  _drawLandmarks() {
    const g = this.zoomGroup.append("g").attr("class", "landmarks");

    for (const lm of this.data.landmarks) {
      // Find Y position by approximate year mapping
      const y = this._yearToY(lm.year);
      if (y === null) continue;

      g.append("line")
        .attr("x1", 0)
        .attr("x2", this._totalWidth)
        .attr("y1", y)
        .attr("y2", y)
        .attr("class", "landmark-line");

      g.append("text")
        .attr("x", this._totalWidth - this.PADDING.right)
        .attr("y", y - 5)
        .attr("class", "landmark-label")
        .attr("text-anchor", "end")
        .text(`${lm.label} (${lm.year} CE)`);
    }
  }

  _yearToY(year) {
    // Map approximate years to generation row positions
    // These are approximate — place landmarks between relevant generations
    const yearToGen = [
      { year: -50, era: "tanna", gen: 1 },
      { year: 30, era: "tanna", gen: 2 },
      { year: 70, era: "tanna", gen: 3 },
      { year: 130, era: "tanna", gen: 4 },
      { year: 170, era: "tanna", gen: 5 },
      { year: 220, era: "amorai", gen: 1 },
      { year: 260, era: "amorai", gen: 2 },
      { year: 290, era: "amorai", gen: 3 },
      { year: 320, era: "amorai", gen: 4 },
      { year: 350, era: "amorai", gen: 5 },
      { year: 390, era: "amorai", gen: 6 },
      { year: 430, era: "amorai", gen: 7 },
    ];

    // Find the two generations this year falls between
    for (let i = 0; i < yearToGen.length - 1; i++) {
      if (year >= yearToGen[i].year && year < yearToGen[i + 1].year) {
        const row = this._rows.find(
          r => r.era === yearToGen[i].era && r.generation === yearToGen[i].generation
        );
        const nextRow = this._rows.find(
          r => r.era === yearToGen[i + 1].era && r.generation === yearToGen[i + 1].generation
        );
        if (row && nextRow) {
          const t = (year - yearToGen[i].year) / (yearToGen[i + 1].year - yearToGen[i].year);
          return row.y + t * (nextRow.y - row.y);
        }
      }
    }
    return null;
  }

  // Divider removed — location is indicated by node color + legend

  _drawEdges() {
    const g = this.zoomGroup.append("g").attr("class", "edges");
    const edges = this._getFilteredEdges();

    for (const edge of edges) {
      const source = this._positions.get(edge.sourceId);
      const target = this._positions.get(edge.targetId);
      if (!source || !target) continue;

      // Calculate center points of nodes
      const sx = source.x + this.NODE_WIDTH / 2;
      const sy = source.y + this.NODE_HEIGHT / 2;
      const tx = target.x + this.NODE_WIDTH / 2;
      const ty = target.y + this.NODE_HEIGHT / 2;

      // Quadratic bezier with midpoint offset for curved paths
      const mx = (sx + tx) / 2 + (ty - sy) * 0.1;
      const my = (sy + ty) / 2;
      const path = `M ${sx} ${sy} Q ${mx} ${my} ${tx} ${ty}`;

      g.append("path")
        .attr("d", path)
        .attr("class", `edge edge-${edge.type}`)
        .attr("data-source", edge.sourceId)
        .attr("data-target", edge.targetId);
    }
  }

  _getFilteredEdges() {
    let edges = this.data.getEdges();
    const filteredIds = new Set(this._getFilteredSages().map(s => s.id));

    // Only show edges between visible sages
    edges = edges.filter(e => filteredIds.has(e.sourceId) && filteredIds.has(e.targetId));

    const REL_TYPE_MAP = {
      "teacher-student": new Set(["teacher", "student"]),
      "family": new Set(["father", "son", "wife", "husband", "brother-in-law"]),
      "sibling": new Set(["sibling"]),
    };
    // Build set of allowed edge types from active relationship filters
    const allowedTypes = new Set();
    for (const relKey of this._activeRelTypes) {
      const types = REL_TYPE_MAP[relKey];
      if (types) for (const t of types) allowedTypes.add(t);
    }
    edges = edges.filter(e => allowedTypes.has(e.type));
    return edges;
  }

  _drawNodes() {
    const g = this.zoomGroup.append("g").attr("class", "nodes");
    const sages = this._getFilteredSages();

    for (const sage of sages) {
      const pos = this._positions.get(sage.id);
      if (!pos) continue;

      const node = g.append("g")
        .attr("class", `node node-${sage.era} node-${sage.location}${sage.nasi ? " node-nasi" : ""}`)
        .attr("data-id", sage.id)
        .attr("transform", `translate(${pos.x}, ${pos.y})`)
        .style("cursor", "pointer");

      node.attr("tabindex", "-1")
        .attr("role", "button")
        .attr("aria-label", `${sage.name.en}, ${sage.name.he}, ${this._formatDates(sage.dates)}`);

      // Background rect
      node.append("rect")
        .attr("width", this.NODE_WIDTH)
        .attr("height", this.NODE_HEIGHT)
        .attr("rx", 8)
        .attr("ry", 8)
        .attr("class", "node-bg");

      // Nasi marker
      if (sage.nasi) {
        node.append("circle")
          .attr("cx", this.NODE_WIDTH - 12)
          .attr("cy", 12)
          .attr("r", 5)
          .attr("class", "nasi-marker");
      }

      // English name
      node.append("text")
        .attr("x", this.NODE_WIDTH / 2)
        .attr("y", 17)
        .attr("text-anchor", "middle")
        .attr("class", "node-name-en")
        .text(sage.name.en);

      // Hebrew name
      node.append("text")
        .attr("x", this.NODE_WIDTH / 2)
        .attr("y", 32)
        .attr("text-anchor", "middle")
        .attr("class", "node-name-he")
        .attr("dir", "rtl")
        .text(sage.name.he);

      // Click handler
      node.on("click", () => {
        if (this.onNodeClick) this.onNodeClick(sage.id);
      });

      // Hover tooltip
      node.append("title")
        .text(`${sage.name.en} (${sage.name.he})\n${this._formatDates(sage.dates)}`);
    }
  }

  _formatDates(dates) {
    return SagesData.formatDates(dates);
  }

  _setupZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([0.05, 3])
      .on("zoom", (event) => {
        this.zoomGroup.attr("transform", event.transform);
      });

    this.svg.call(this.zoom);

    // Initial fit-to-view
    this.fitToView();
  }

  fitToView() {
    const containerRect = this.container.getBoundingClientRect();
    if (containerRect.width < 10 || containerRect.height < 10) return;

    const scaleX = containerRect.width / this._totalWidth;
    const scaleY = containerRect.height / this._totalHeight;
    const scale = Math.min(scaleX, scaleY, 1) * 0.9;
    const tx = (containerRect.width - this._totalWidth * scale) / 2;
    const ty = (containerRect.height - this._totalHeight * scale) / 2;

    this.svg.call(
      this.zoom.transform,
      d3.zoomIdentity.translate(tx, ty).scale(scale)
    );
  }

  /**
   * Initial zoom — start zoomed in enough to read names, centered on actual node content.
   */
  initialZoom() {
    const containerRect = this.container.getBoundingClientRect();
    if (containerRect.width < 10 || containerRect.height < 10) return;

    // Find the bounding box of actual nodes (not the full canvas)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [, pos] of this._positions) {
      minX = Math.min(minX, pos.x);
      minY = Math.min(minY, pos.y);
      maxX = Math.max(maxX, pos.x + this.NODE_WIDTH);
      maxY = Math.max(maxY, pos.y + this.NODE_HEIGHT);
    }
    if (minX === Infinity) return; // no nodes

    const contentWidth = maxX - minX + 40;

    // Scale to fit content WIDTH only — user scrolls vertically
    const scale = Math.min(containerRect.width / contentWidth, 0.8) * 0.9;

    // Center horizontally on content, start from top
    const contentCenterX = (minX + maxX) / 2;
    const tx = containerRect.width / 2 - contentCenterX * scale;
    const ty = 10 - minY * scale + 10;

    this.svg.call(
      this.zoom.transform,
      d3.zoomIdentity.translate(tx, ty).scale(scale)
    );
  }

  /**
   * Highlight a sage and their direct connections. Dims all others.
   */
  selectSage(id) {
    this._selectedId = id;
    const rels = this.data.getRelationships(id);
    const connectedIds = new Set([id, ...rels.map(r => r.targetId)]);

    // Dim non-connected nodes
    this.zoomGroup.selectAll(".node")
      .each(function () {
        const nodeId = this.getAttribute("data-id");
        d3.select(this).classed("node-dimmed", !connectedIds.has(nodeId));
        d3.select(this).classed("node-selected", nodeId === id);
      });

    // Dim non-connected edges
    this.zoomGroup.selectAll(".edge").each(function () {
      const source = this.getAttribute("data-source");
      const target = this.getAttribute("data-target");
      const connected = connectedIds.has(source) && connectedIds.has(target);
      d3.select(this).classed("edge-dimmed", !connected);
      d3.select(this).classed("edge-highlighted", connected);
    });
  }

  /**
   * Clear selection highlighting.
   */
  clearSelection() {
    this._selectedId = null;
    this.zoomGroup.selectAll(".node")
      .classed("node-dimmed", false)
      .classed("node-selected", false);
    this.zoomGroup.selectAll(".edge")
      .classed("edge-dimmed", false)
      .classed("edge-highlighted", false);
  }

  /**
   * Pan to center a specific sage in the viewport.
   */
  panToSage(id) {
    const pos = this._positions.get(id);
    if (!pos) return;

    const containerRect = this.container.getBoundingClientRect();
    const currentTransform = d3.zoomTransform(this.svg.node());
    const scale = currentTransform.k;

    const tx = containerRect.width / 2 - (pos.x + this.NODE_WIDTH / 2) * scale;
    const ty = containerRect.height / 2 - (pos.y + this.NODE_HEIGHT / 2) * scale;

    this.svg.transition().duration(500).call(
      this.zoom.transform,
      d3.zoomIdentity.translate(tx, ty).scale(scale)
    );
  }

  /**
   * Update filters and re-render.
   */
  setFilters({ activeGroups, activeRelTypes }) {
    if (activeGroups !== undefined) this._activeGroups = activeGroups;
    if (activeRelTypes !== undefined) this._activeRelTypes = activeRelTypes;
    this.render();
  }

  /**
   * Zoom in/out by a step.
   */
  zoomStep(direction) {
    const factor = direction === "in" ? 1.3 : 1 / 1.3;
    this.svg.transition().duration(200).call(this.zoom.scaleBy, factor);
  }
}

window.SagesGraph = SagesGraph;
