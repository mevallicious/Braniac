import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useMemories } from '../../hooks/useMemories';
import { Share2, Target, Activity, X, Tag, FileImage, Video, FileText, Link as LinkIcon } from 'lucide-react';

const KnowledgeGraph = () => {
  const svgRef = useRef();
  const containerRef = useRef(); 
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

  // 🎯 SMART THUMBNAIL EXTRACTOR (BULLETPROOF)
  const getThumbnailUrl = (node) => {
    // 1. Combine everything into one string to ensure we don't miss the link
    const stringToSearch = `${node.content || ''} ${node.fileUrl || ''}`;

    // 2. Check for YouTube IDs
    if (node.type === 'youtube' || stringToSearch.includes('youtu')) {
      const match = stringToSearch.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match && match[1]) {
         return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    }
    
    // 3. ONLY return fileUrl if this node is explicitly an image
    if (node.type === 'image' && node.fileUrl) {
      return node.fileUrl;
    }

    // 4. No valid image found, fallback to sleek icons
    return null;
  };

  useEffect(() => {
    if (!memories.length) return;

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

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(200))
      .force("charge", d3.forceManyBody().strength(-800)) 
      .force("center", d3.forceCenter(width / 2, height / 2)) 
      .force("collision", d3.forceCollide().radius(70))
      .force("x", d3.forceX(width / 2).strength(0.1)) 
      .force("y", d3.forceY(height / 2).strength(0.1)); 

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

  // Derived state for the image URL
  const activeThumbnail = selectedNode ? getThumbnailUrl(selectedNode) : null;

  return (
    <div className="page-container full-screen">
      <div className="graph-page" ref={containerRef}>
        
        {/* GRAPH HUD */}
        <div className="graph-controls">
          <div className="control-badge active">
            <Share2 size={14} /> <span>{memories.length} Nodes Mapped</span>
          </div>
          <div className="control-hint">
            <Activity size={14} /> <span>Neural link active</span>
          </div>
        </div>

        <svg ref={svgRef} className="neural-canvas"></svg>

        {/* 🎯 THE NODE POPUP OVERLAY */}
        {selectedNode && (
          <div className="node-modal-overlay" onClick={() => setSelectedNode(null)}>
            <div className="node-modal" onClick={(e) => e.stopPropagation()}>
              
              <button className="close-modal-btn" onClick={() => setSelectedNode(null)}>
                <X size={20} />
              </button>

              <div className="modal-header">
                <span className="node-type-badge" style={{ color: getTypeColor(selectedNode.type), borderColor: getTypeColor(selectedNode.type) }}>
                  {selectedNode.type.toUpperCase()} NODE
                </span>
              </div>

              {/* 🎯 SMART IMAGE RENDERER */}
              {activeThumbnail ? (
                <div className="modal-image-container">
                  <img src={activeThumbnail} alt="Node content" />
                </div>
              ) : (
                <div className="modal-no-image">
                  {selectedNode.type === 'youtube' ? <Video size={32} opacity={0.3} color="#ef4444" /> :
                   selectedNode.type === 'pdf' ? <FileText size={32} opacity={0.3} color="#8b5cf6" /> :
                   selectedNode.type === 'link' ? <LinkIcon size={32} opacity={0.3} color="#06b6d4" /> :
                   <FileImage size={32} opacity={0.3} color="#10b981" />}
                </div>
              )}

              {/* CONTENT */}
              <div className="modal-body">
                <p style={{ wordBreak: 'break-word' }}>
                  {selectedNode.content?.startsWith('http') ? (
                    <a href={selectedNode.content} target="_blank" rel="noopener noreferrer" style={{ color: '#ff2e2e', textDecoration: 'underline' }}>
                      {selectedNode.content}
                    </a>
                  ) : (
                    selectedNode.content
                  )}
                </p>
                {selectedNode.summary && (
                  <div className="modal-summary">
                    <strong>AI Summary:</strong> {selectedNode.summary}
                  </div>
                )}
              </div>

              {/* TAGS */}
              <div className="modal-footer">
                <Tag size={16} color="#ff2e2e" />
                <div className="tags-container">
                  {selectedNode.tags?.map(tag => (
                    <span key={tag} className="node-tag">#{tag}</span>
                  )) || <span className="node-tag">#untagged</span>}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default KnowledgeGraph;