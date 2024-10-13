import React, { useEffect, useRef, useState, useMemo } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import cytoscape from "cytoscape";
import data from "./data.json";
import debounce from "lodash.debounce";
import IconButton from "@mui/material/IconButton";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import Button from "@mui/material/Button";
import SearchIcon from "@mui/icons-material/Search";
import Slider from "@mui/material/Slider"; // Import Slider

function NetworkGraph({ setSearchTerm, onSearchSubmit }) {
  const networkRef = useRef(null);
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(data.maxConnect);
  const [thresold, setThresold] = useState(9); // State for thresold

  const elements = useMemo(() => {
    const nodes = [];
    const edges = [];
    for (let i = 1; i < 1331; i++) {
      const weight = data.counts[i - 1].count;
      if (weight > thresold) {
        nodes.push({
          data: {
            id: `${i}`,
            weight: weight,
            visible: weight >= 14,
            size: weight >= 14 ? 30 : 10,
          },
        });
      }
    }
    for (let i = 0; i < data.links.length; i++) {
      const fromId = data.links[i].from;
      const toId = data.links[i].to;
      if (
        nodes.some((node) => node.data.id === `${fromId}`) &&
        nodes.some((node) => node.data.id === `${toId}`)
      ) {
        edges.push({
          data: {
            source: `${fromId}`,
            target: `${toId}`,
          },
        });
      }
    }
    return { nodes, edges };
  }, [thresold]);

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
        setSelectedNodeInfo([
          {
            id: node.data("id"),
            weight: node.data("weight"),
          },
        ]);
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
  }, [elements, setSearchTerm, onSearchSubmit]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={networkRef} style={{ height: "600px", background: "black" }} />
      <div
        style={{
          position: "absolute",
          top: "15px",
          right: "70px",
          zIndex: 10,
          color: "white",
        }}
      >
        <Slider
          value={thresold}
          onChange={(e, newValue) => setThresold(newValue)}
          min={5}
          max={20}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => `Connections: ${value}`}
          style={{ width: "40px" }}
        />
      </div>
      <IconButton
        onClick={() => window.resetLayout()}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 10,
          color: "white",
        }}
        color="primary"
      >
        <ZoomOutMapIcon />
      </IconButton>
      {selectedNodeInfo && selectedNodeInfo.length < 2 && (
        <div style={{ color: "grey", marginTop: "10px" }}>
          Search Kural :{" "}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            onClick={onSearchSubmit}
          >
            {selectedNodeInfo[0].id}
          </Button>{" "}
          It is connected with {selectedNodeInfo[0].weight} other kurals.
        </div>
      )}
      {selectedNodeInfo && selectedNodeInfo.length > 1 && (
        <div style={{ color: "grey", marginTop: "10px" }}>
          Most connected kurals (&gt; 25 times) :{" "}
          <div style={{ color: "grey", marginTop: "10px" }}>
            {selectedNodeInfo.map((kural) => (
              <Button
                key={kural.id}
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => {
                  setSearchTerm(kural.id);
                  onSearchSubmit();
                }}
                style={{ margin: "5px" }}
              >
                {kural.id}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

NetworkGraph.propTypes = {
  setSearchTerm: PropTypes.func.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
};

export default NetworkGraph;
