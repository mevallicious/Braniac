import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMemories } from '../../hooks/useMemories';
import ChatPanel from '../components/ChatPanel';
import { Share2, Target, Activity } from 'lucide-react';

const KnowledgeGraph = () => {
  const svgRef = useRef();
  const containerRef = useRef(); // New ref for the parent div
  const { memories } = useMemories();
  const [selectedNode, setSelectedNode] = useState(null);

  const getTypeColor = (type) => {
    const t = type?.toLowerCase();
    switch (t) {
      case 'youtube': return '#ef4444'; 
      case 'image': return '#10b981';   
      case 'pdf': return '#8b5cf6';     
      case 'text': return '#f59e0b';
      case 'tweet': case 'link': return '#06b6d4'; 
      case 'audio': case 'song': return '#ec4899'; 
      default: return '#3b82f6';        
    }
  };

  useEffect(() => {
    if (!memories.length) return;

    // --- 🛠️ DYNAMIC DIMENSIONS ---
    const updateDimensions = () => {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      return { width, height };
    };

    let { width, height } = updateDimensions();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    svg.selectAll("*").remove();

    const nodes = memories.map(m => ({ ...m, id: m._id }));
    const links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].type === nodes[j].type || nodes[i].tags?.some(t => nodes[j].tags?.includes(t))) {
          links.push({ source: nodes[i].id, target: nodes[j].id });
        }
      }
    }

    // --- 🧠 TUNED FORCE SIMULATION ---
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200)) // Increased distance
      .force("charge", d3.forceManyBody().strength(-800)) // Stronger repulsion to fill gaps
      .force("center", d3.forceCenter(width / 2, height / 2)) // Force center to actual middle
      .force("collision", d3.forceCollide().radius(70))
      .force("x", d3.forceX(width / 2).strength(0.1)) // Gently pull to horizontal center
      .force("y", d3.forceY(height / 2).strength(0.1)); // Gently pull to vertical center

    const link = svg.append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("class", "neural-path");

    const node = svg.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", d => `node-group ${d.type?.toLowerCase()}`)
      .call(drag(simulation))
      .on("click", (event, d) => setSelectedNode(d));

    node.append("circle")
      .attr("r", 12)
      .attr("fill", d => getTypeColor(d.type))
      .attr("class", "node-orb");

    node.append("circle")
      .attr("r", 20)
      .attr("fill", d => getTypeColor(d.type))
      .attr("class", "node-pulse")
      .style("opacity", 0.15);

    node.append("text")
      .text(d => d.content?.substring(0, 15) + "...")
      .attr("x", 20)
      .attr("y", 5)
      .attr("class", "node-label");

    simulation.on("tick", () => {
      link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // --- 🔄 RESIZE HANDLER ---
    const handleResize = () => {
      const { width: newWidth, height: newHeight } = updateDimensions();
      svg.attr("width", newWidth).attr("height", newHeight).attr("viewBox", [0, 0, newWidth, newHeight]);
      simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2)).alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    function drag(simulation) {
      return d3.drag()
        .on("start", (e, d) => { if (!e.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
        .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on("end", (e, d) => { if (!e.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; });
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [memories]);

  return (
    <div className="page-container full-screen">
        <div className="graph-page" ref={containerRef}>
      <div className="graph-controls">
        <div className="control-badge active">
          <Share2 size={14} /> <span>{memories.length} Nodes Mapped</span>
        </div>
        <div className="control-hint">
          <Activity size={14} /> <span>Neural link active</span>
        </div>
      </div>

      <svg ref={svgRef} className="neural-canvas"></svg>

      {selectedNode && (
        <ChatPanel 
          memoryId={selectedNode._id} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
    </div>
  );
};

export default KnowledgeGraph;