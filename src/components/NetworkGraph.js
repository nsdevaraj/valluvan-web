import React, { useEffect, useRef } from "react";
import { Network } from "vis-network";
import data from "./data.json";

function NetworkGraph() {
  const networkRef = useRef(null);
  data.nodes = [];
  for (let i = 0; i < 1331; i++) {
    data.nodes.push({
      id: i,
      label: String(i),
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
    };

    const network = new Network(container, data, options);

    return () => {
      network.destroy();
    };
  }, []);

  return <div ref={networkRef} style={{ height: "600px" }} />;
}

export default NetworkGraph;
