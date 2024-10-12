import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import data from "./data.json";

function NetworkGraph() {
  const networkRef = useRef(null);
  data.nodes = [];
  data.edges = [];
  for (let i = 0; i < 1331; i++) {
    data.nodes.push({
      data: { id: `${i}`, label: `Kno ${i}` },
    });
  }

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
            "background-color": "#666",
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
