import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import data from "./data.json";
let influencers = [];
function influencerNodes() {
  for (let index = 0; index < data.counts.length; index++) {
    if (data.counts[index].count > 10) {
      influencers.push({ id: data.counts[index].id });
    }
  }
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
  influencers = influencerNodes();
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
            "background-color":
              "data(id) in influencers ? '#FF0000' : '#660000'",
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
