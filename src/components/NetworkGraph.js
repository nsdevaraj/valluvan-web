import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";
import data from "./data.json";

function NetworkGraph() {
  const networkRef = useRef(null);
  data.nodes = [];
  data.edges = [];
  for (let i = 0; i < 1331; i++) {
    data.nodes.push({
      id: i,
      label: `Kno ${i}`,
    });
  }

  for (let i = 0; i < 1330; i++) {
    data.edges.push({
      from: i,
      to: i + 1,
    });
  }

  useEffect(() => {
    const container = networkRef.current;
    const options = {
      nodes: {
        shape: "dot",
        size: 16,
        font: {
          size: 16,
          color: "#ffffff",
        },
        borderWidth: 2,
      },
      edges: {
        width: 2,
      },
      physics: {
        enabled: true,
      },
      layout: {
        improvedLayout: false,
      },
    };

    const network = new Network(container, data, options);

    return () => {
      network.destroy();
    };
  }, []);

  return <div ref={networkRef} style={{ height: "600px" }} />;
}

export default NetworkGraph;
