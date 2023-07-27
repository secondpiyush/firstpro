const adminData = {
  id_1: {
    name: "Storage Tank 1",
    type: "DISTRIBUTER",
    location: [81.60574248420107, 21.239487688845408],
    rate: 20,
    parent: null,
    contact: "7389026213",
  },
  id_2: {
    name: "Science College",
    type: "CONSUMER",
    location: [81.60213769615038, 21.247746351982528],
    rate: 100,
    parent: "id_1",
  },
  id_3: {
    name: "NIT Raipur",
    type: "CONSUMER",
    location: [81.60503448188233, 21.249926229557413],
    rate: 200,
    parent: "id_1",
  },
  id_4: {
    name: "Pt. Ravishankar University",
    type: "CONSUMER",
    location: [81.59740438151687, 21.24719369185602],
    rate: 200,
    parent: "id_1",
  },
  id_5: {
    name: "Anupam Garden",
    type: "CONSUMER",
    location: [81.6094778239714, 21.24444189976652],
    rate: 50,
    parent: "id_1",
  },
  id_6: {
    name: "Disha College",
    type: "CONSUMER",
    location: [81.61217539122049, 21.252119137746092],
    rate: 100,
    parent: "id_1",
  },
  id_7: {
    name: "Sarawati Nagar Station",
    type: "CONSUMER",
    location: [81.60427434747515, 21.25231754176621],
    rate: 50,
    parent: "id_1",
  },
  id_8: {
    name: "Shree Khatu Sham Mandir",
    type: "CONSUMER",
    location: [81.61762101951886, 21.24571792060598],
    rate: 100,
    parent: "id_11",
  },
  id_9: {
    name: "Gaytri Mandir",
    type: "CONSUMER",
    location: [81.61923034492548, 21.248397802445716],
    rate: 0,
    parent: "id_11",
  },
  id_10: {
    name: "LifeWorth Hospital",
    type: "CONSUMER",
    location: [81.61781413857244, 21.246537889599832],
    rate: 300,
    parent: "id_11",
  },
  id_11: {
    name: "Storage Tank 2",
    type: "DISTRIBUTER",
    location: [81.61238534753156, 21.245497928116794],
    rate: 600,
    parent: "id_1",
    contact: "8871352717",
  },
};

const getIntermediateGraph = (adminData) => {
  const intermediateData = {};
  // make place for parents
  for (const [key, value] of Object.entries(adminData)) {
    const { type, rate } = value;
    if (value.type === "DISTRIBUTER") {
      intermediateData[key] = {
        rate,
        children: {},
      };
    }
  }

  // add children data
  for (const [key, value] of Object.entries(adminData)) {
    const { type, rate, parent } = value;
    if (parent) {
      intermediateData[parent].children[key] = rate;
    }
  }

  return intermediateData;
};
const getColor = (ratio) => {
  if (ratio >= 0.9) return "#06FF00";
  if (ratio >= 0.75) return "#FFE61B";
  return "#FC4F4F";
};
const getThreat = (ratio) => {
  if (ratio >= 0.9) return "LOW";
  if (ratio >= 0.75) return "MEDIUM";
  return "HIGH";
};
const getRatio = (parentObject) => {
  const rateSent = parentObject.rate;
  let rateReceived = 0;
  for (const [childKey, childValue] of Object.entries(parentObject.children)) {
    rateReceived += childValue;
  }
  const lossRatio = rateReceived / rateSent;
  return lossRatio;
};

const getGraphConfig = (adminData, intermediateData) => {
  const graphConfig = {
    nodes: {},
    edges: [],
  };
  for (const [key, value] of Object.entries(adminData)) {
    const { name, type, location } = adminData[key];
    graphConfig.nodes[key] = {
      name,
      type,
      location,
    };
  }

  for (const [parentKey, parentValue] of Object.entries(intermediateData)) {
    const rateSent = parentValue.rate;
    let rateReceived = 0;
    for (const [childKey, childValue] of Object.entries(parentValue.children)) {
      rateReceived += childValue;
    }
    const lossRatio = rateReceived / rateSent;
    console.log("loss = ", lossRatio, rateSent, rateReceived, "parent = ", [
      parentKey,
      parentValue,
    ]);

    for (const [childKey, childValue] of Object.entries(parentValue.children)) {
      graphConfig.edges.push({
        from: parentKey,
        to: childKey,
        color: getColor(lossRatio),
      });
    }
  }

  return graphConfig;
};
const intermediateData = getIntermediateGraph(adminData);
console.log("intermeditate data", intermediateData);
const graphConfig = getGraphConfig(adminData, intermediateData);

graphConfig.size = {
  consumer: 80,
  distributer: 180,
};

console.log("graph config", graphConfig);

mapboxgl.accessToken =
  "pk.eyJ1IjoiaWFtYXNodXRvc2hwYW5kYSIsImEiOiJjbDAyYWV1YWEwbDBtM2RvZjZkZzh2Nm9zIn0.UXUpdH6YPHWqj7S5ZbNXhA";
// Set bounds to San Francisco, California.
const nitRaipurBounds = [
  [81.527, 21.205], // Southwest coordinates
  [81.7, 21.308], // Northeast coordinates
];
const locationNitRaipur = [81.61783408307898, 21.256805819893767];
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v11", // style URL
  center: locationNitRaipur, // starting position
  zoom: 13,
  /* maxBounds: nitRaipurBounds, // Set the map's geographical boundaries. */
});

// This implements `StyleImageInterface`
// to draw a pulsing dot icon on the map.
const pulsingDotDistributor = (lossRatio) => {
  return {
    width: graphConfig.size.distributer,
    height: graphConfig.size.distributer,
    rgbColorString: {
      LOW: {
        outer: "101, 193, 140",
        inner: "19, 148, 135",
      },
      MEDIUM: {
        outer: "255, 250, 77",
        inner: "255, 250, 77",
      },
      HIGH: {
        outer: "255, 114, 114",
        inner: "242, 120, 159",
      },
    },
    data: new Uint8Array(
      graphConfig.size.distributer * graphConfig.size.distributer * 4
    ),

    // When the layer is added to the map,
    // get the rendering context for the map canvas.
    onAdd: function () {
      const canvas = document.createElement("canvas");
      canvas.width = this.width;
      canvas.height = this.height;
      this.context = canvas.getContext("2d");
    },

    // Call once before every frame where the icon will be used.
    render: function () {
      const threat = getThreat(lossRatio);
      const duration = 1000;
      const t = (performance.now() % duration) / duration;

      const radius = (graphConfig.size.distributer / 2) * 0.3;
      const outerRadius = (graphConfig.size.distributer / 2) * 0.7 * t + radius;
      const context = this.context;

      if (threat === "MEDIUM" || threat === "HIGH") {
        // Draw the outer circle.
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
          this.width / 2,
          this.height / 2,
          outerRadius,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(${this.rgbColorString[threat].outer}, ${
          1 - t
        })`;
        context.fill();
      }

      // Draw the inner circle.
      context.beginPath();
      context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${this.rgbColorString[threat].inner}, 1)`;
      context.strokeStyle = "white";
      context.lineWidth = 2 + 4 * (1 - t);
      context.fill();
      context.stroke();

      // Update this image's data with data from the canvas.
      this.data = context.getImageData(0, 0, this.width, this.height).data;

      // Continuously repaint the map, resulting
      // in the smooth animation of the dot.
      map.triggerRepaint();

      // Return `true` to let the map know that the image was updated.
      return true;
    },
  };
};

const pulsingDotConsumer = {
  width: graphConfig.size.consumer,
  height: graphConfig.size.consumer,
  data: new Uint8Array(
    graphConfig.size.consumer * graphConfig.size.consumer * 4
  ),

  // When the layer is added to the map,
  // get the rendering context for the map canvas.
  onAdd: function () {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d");
  },

  // Call once before every frame where the icon will be used.
  render: function () {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (graphConfig.size.consumer / 2) * 0.3;
    const outerRadius = (graphConfig.size.consumer / 2) * 0.7 * t + radius;
    const context = this.context;

    // Draw the inner circle.
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(8, 69, 148, 1)";
    context.strokeStyle = "white";
    context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // Update this image's data with data from the canvas.
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // Continuously repaint the map, resulting
    // in the smooth animation of the dot.
    map.triggerRepaint();

    // Return `true` to let the map know that the image was updated.
    return true;
  },
};

const addEdgeToGraph = async (myMap, fromLocation, toLocation, color) => {
  const uniqueId = `EDGE ${fromLocation} - ${toLocation}`;
  var requestOptions = {
    method: "GET",
    redirect: "follow",
  };
  const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${fromLocation[0]},${fromLocation[1]};${toLocation[0]},${toLocation[1]}?access_token=${mapboxgl.accessToken}&geometries=geojson`;
  const intermediatePoints = [];
  const response = await fetch(url, requestOptions);
  const result = await response.json();
  console.log(result);
  result.routes[0].geometry.coordinates.forEach((location) =>
    intermediatePoints.push(location)
  );

  myMap.addSource(uniqueId, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [...intermediatePoints, toLocation],
      },
    },
  });
  myMap.addLayer({
    id: uniqueId,
    type: "line",
    source: uniqueId,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": color,
      "line-width": 3,
    },
  });
};
const addPointToMap = (myMap, location, type, title, key, intermediateData) => {
  const uniqueId = `POINT - ${location}`;
  myMap.addSource(uniqueId, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            title: title,
          },
          geometry: {
            type: "Point",
            coordinates: location, // icon position [lng, lat]
          },
        },
      ],
    },
  });

  if (type === "CONSUMER") {
    myMap.addLayer({
      id: uniqueId,
      type: "symbol",
      source: uniqueId,
      layout: {
        "icon-image": "pulsing-dot-consumer",
        "text-field": ["get", "title"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
        "text-size": 10,
        "icon-allow-overlap": true,
        //'text-allow-overlap' :true,
        "icon-ignore-placement": true,
        //'text-ignore-placement':true
      },
    });
  } else {
    const ratio = getRatio(intermediateData[key]);
    const threat = getThreat(ratio);
    myMap.addLayer({
      id: uniqueId,
      type: "symbol",
      source: uniqueId,
      layout: {
        "icon-image": `pulsing-dot-distributor-${threat}`,
        "text-field": ["get", "title"],
        "text-offset": [0, 1.25],
        "text-anchor": "top",
        "text-size": 10,
        "icon-allow-overlap": true,
        //'text-allow-overlap' :true,
        "icon-ignore-placement": true,
        //'text-ignore-placement':true
      },
    });
  }
};

map.on("load", () => {
  map.addImage("pulsing-dot-distributor-LOW", pulsingDotDistributor(0.9), {
    pixelRatio: 2,
  });
  map.addImage("pulsing-dot-distributor-MEDIUM", pulsingDotDistributor(0.75), {
    pixelRatio: 2,
  });
  map.addImage("pulsing-dot-distributor-HIGH", pulsingDotDistributor(0), {
    pixelRatio: 2,
  });
  map.addImage("pulsing-dot-consumer", pulsingDotConsumer, {
    pixelRatio: 2,
  });
  for (const [key, value] of Object.entries(graphConfig.nodes)) {
    const { location, type, name } = value;
    addPointToMap(map, location, type, name, key, intermediateData);
  }
  graphConfig.edges.forEach((edge) => {
    const { from, to, color } = edge;
    addEdgeToGraph(
      map,
      graphConfig.nodes[from].location,
      graphConfig.nodes[to].location,
      color
    );
  });
});
