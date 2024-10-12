import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";
import data from "./data.json";

console.log(data.links.length, "links");
function influencerNodes() {
  var keyVals = [];
  var influencers = [];
  for (let index = 0; index < data.links.length; index++) {
    const element = data.links[index];
    var pairs = [];
    pairs.push(element.from, element.to);
    pairs.sort((a, b) => a - b);

    keyVals.push({ id: pairs[0], value: pairs[1] });
  }
  keyVals.sort((a, b) => a.id - b.id);

  for (let index = 0; index < keyVals.length; index++) {
    if (
      !influencers.find((influencer) => influencer.id === keyVals[index].id)
    ) {
      influencers.push({ id: keyVals[index].id, count: 1 });
    } else {
      influencers.find(
        (influencer) => influencer.id === keyVals[index].id
      ).count += 1;
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
