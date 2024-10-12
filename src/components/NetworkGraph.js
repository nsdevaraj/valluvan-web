import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import data from "./data.json";

function influencerNodes() {
  const influencers = [];
  for (let i = 0; i < data.links.length; i++) {
    const edge = data.links[i];
    const fromNode = data.nodes.find((node) => node.data.id === edge.from);
    const toNode = data.nodes.find((node) => node.data.id === edge.to);
    if (fromNode && toNode) {
      influencers.push(fromNode);
    }
  }
  console.log(influencers, "influencers");
  return influencers;
}

function NetworkGraph() {
  const networkRef = useRef(null);
  data.nodes = [];
  data.edges = [];
  for (let i = 0; i < 1331; i++) {
    data.nodes.push({
      data: { id: `${i}`, label: `Kno ${i}` },
    });
  }
  influencerNodes();
  for (let i = 0; i < data.links.length; i++) {
    data.edges.push({
      data: {
        source: `${data.links[i].from}`,
        target: `${data.links[i].to}`,
      },
    });
  }

  useEffect(() => {
    const cy = cytoscape({
      container: networkRef.current,
      elements: {
        nodes: data.nodes,
        edges: data.edges,
      },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "#660000",
            label: "data(label)",
            "font-size": "16px",
            color: "#ffffff",
            width: "16px",
            height: "16px",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": "#ccc",
          },
        },
      ],
      layout: {
        name: "random",
        rows: 133,
      },
    });

    return () => {
      cy.destroy();
    };
  }, []);

  return (
    <div ref={networkRef} style={{ height: "600px", background: "black" }} />
  );
}

export default NetworkGraph;
