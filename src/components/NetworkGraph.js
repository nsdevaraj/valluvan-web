import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import cytoscape from "cytoscape";
import data from "./data.json";
import debounce from "lodash.debounce";

function NetworkGraph({ setSearchTerm }) {
  const networkRef = useRef(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);

  const elements = useMemo(() => {
    const nodes = [];
    const edges = [];
    for (let i = 1; i < 1331; i++) {
      const weight = data.counts[i - 1].count;
      nodes.push({
        data: {
          id: `${i}`,
          weight: weight,
          visible: weight >= 22,
          size: weight >= 22 ? 30 : 10,
        },
      });
    }
    for (let i = 0; i < data.links.length; i++) {
      edges.push({
        data: {
          source: `${data.links[i].from}`,
          target: `${data.links[i].to}`,
        },
      });
    }
    return { nodes, edges };
  }, []);

  useEffect(() => {
    if (!networkRef.current) {
      console.error("Network container is not available.");
      return;
    }
    const defaultLayout = {
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
    };
    const timeoutId = setTimeout(() => {
      const cy = cytoscape({
        container: networkRef.current,
        elements,
        style: [
          {
            selector: "node",
            style: {
              "background-color": "mapData(weight, 5, 33, #66ffff, #FF0000)",
              visibility: "data(visible) ? 'visible' : 'hidden'",
              label: "data(id)",
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
        layout: defaultLayout,
      });

      const handleNodeTap = debounce((event) => {
        const node = event.target;
        console.log(`Node clicked: ${node.data("id")}`);
        if (setSearchTerm) {
          setSearchTerm(node.data("id"));
        }
        setSelectedNodeInfo({
          id: node.data("id"),
          weight: node.data("weight"),
        });
      }, 300);

      cy.on("tap", "node", handleNodeTap);

      const resetLayout = () => {
        cy.layout(defaultLayout).run();
      };

      window.resetLayout = resetLayout;

      return () => {
        console.log("Destroying Cytoscape instance");
        cy.destroy();
      };
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [elements, setSearchTerm]);

  return (
    <div>
      <div ref={networkRef} style={{ height: "600px", background: "black" }} />
      {selectedNodeInfo && (
        <div style={{ color: "grey", marginTop: "10px" }}>
          <h4>
            Selected Kural {selectedNodeInfo.id}, click Search to know more.
            <br />
            Connected with other {selectedNodeInfo.weight} kurals
          </h4>
        </div>
      )}
      <button
        onClick={() => window.resetLayout()}
        style={{ marginTop: "10px" }}
      >
        Reset Zoom
      </button>
    </div>
  );
}

NetworkGraph.propTypes = {
  setSearchTerm: PropTypes.func.isRequired,
};

export default NetworkGraph;
