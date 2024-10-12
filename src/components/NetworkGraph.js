import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import cytoscape from "cytoscape";
import data from "./data.json";

function NetworkGraph({ setSearchTerm }) {
  const networkRef = useRef(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);

  data.nodes = [];
  data.edges = [];
  for (let i = 1; i < 1331; i++) {
    const weight = data.counts[i - 1].count;
    data.nodes.push({
      data: {
        id: `${i}`,
        label: `Kno ${i}`,
        weight: weight,
        displayLabel: weight > 20 ? `Kno ${i}` : `${i}`,
        visible: weight >= 20,
        size: weight >= 20 ? 20 : 10,
      },
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
    if (!networkRef.current) {
      console.error("Network container is not available.");
      return;
    }

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
            "background-color": "mapData(weight, 5, 33, #66ffff, #FF0000)",
            visibility: "data(visible) ? 'visible' : 'hidden'",
            label: "data(displayLabel)",
            "font-size": "16px",
            color: "#000000",
            width: "data(size)",
            height: "data(size)",
          },
        },
        {
          selector: "edge",
          style: {
            width: "1",
            "line-color": "#ccc",
          },
        },
      ],
      layout: {
        name: "cose",
        idealEdgeLength: 100,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 30,
        randomize: true,
        componentSpacing: 100,
        nodeRepulsion: 400000,
        edgeElasticity: 100,
        nestingFactor: 5,
        gravity: 80,
        numIter: 1000,
        initialTemp: 200,
        coolingFactor: 0.95,
        minTemp: 1.0,
      },
    });

    cy.on("tap", "node", (event) => {
      const node = event.target;
      console.log(`Node clicked: ${node.data("id")}`);
      if (setSearchTerm) {
        setSearchTerm(node.data("id"));
      }
      setSelectedNodeInfo({
        id: node.data("id"),
        label: node.data("label"),
        weight: node.data("weight"),
      });
    });

    return () => {
      console.log("Destroying Cytoscape instance");
      cy.destroy();
    };
  }, [setSearchTerm]);

  return (
    <div>
      <div ref={networkRef} style={{ height: "600px", background: "black" }} />
      {selectedNodeInfo && (
        <div style={{ color: "grey", marginTop: "20px" }}>
          <h6>
            Selected Kural {selectedNodeInfo.id}, click Search to know more.
            <br />
            Connected with other {selectedNodeInfo.weight} kurals
          </h6>
        </div>
      )}
    </div>
  );
}

NetworkGraph.propTypes = {
  setSearchTerm: PropTypes.func.isRequired,
};

export default NetworkGraph;
