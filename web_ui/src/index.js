// require("dotenv").config();
// const axios = require("axios");
// const datepicker = require("js-datepicker");

let wantedDate = new Date();
let today = new Date();
wantedDate.setDate(wantedDate.getDate() - 5);
let baseURL = "http://127.0.0.1:5000/";
let newURL = "http://172.16.99.94:5000/";

document.getElementById("day").innerHTML = `Date: ${
  wantedDate.getMonth() +
  1 +
  "/" +
  wantedDate.getDate() +
  "/" +
  wantedDate.getFullYear()
}`;

// const picker = datepicker("#simple", {
//   onSelect: (instance, date) => {
//     wantedDate = date;
//     console.log(date);
//   },
//   dateSelected: wantedDate,
// });
import "regenerator-runtime/runtime";

mapboxgl.accessToken =
  "pk.eyJ1IjoicmJob2ciLCJhIjoiY2wwM2M3bHY0MGhueTNqcm5iN2pna3I2ZiJ9.158d5oilXkISjK476I7uPQ";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v10",
  center: [-88.2249588460582, 40.113983290286015],
  zoom: 17,
});

console.log("map created");

map.on("load", async () => {
  console.log("map loaded");
  const geojson = await getData();

  console.log(geojson);

  map.addSource("crops", {
    type: "geojson",
    data: geojson,
  });

  map.addLayer({
    id: "crops",
    type: "circle",
    source: "crops",
    paint: {
      "circle-color": [
        "match",
        ["get", "classification"],
        "Mosaic Disease",
        "#785C9C",
        "Bacterial Blight",
        "#5C839C",
        "Green Mite",
        "#00FF00",
        "Brown Streak Disease",
        "#915A17",
        "#000000",
      ],
      "circle-radius": 8,
    },
  });

  const updateSource = setInterval(async () => {
    const geojson = await getData(updateSource);
    map.getSource("crops").setData(geojson);
    const bounds = new mapboxgl.LngLatBounds(
      geojson.features[0].geometry.coordinates,
      geojson.features[0].geometry.coordinates
    );

    geojson.features.forEach(feature => {
        bounds.extend(feature.geometry.coordinates);
    })
    map.fitBounds(bounds, { padding: 50 });
  }, 1000);

  async function getData(updateSource) {
    // Make a GET request to the API and return the location of the ISS.
    try {
      const response = await fetch(
        `/api/v1/get_data?date=${wantedDate
          .toISOString()
          .split("T")[0]
          .replace("-", "")
          .replace("-", "")}`,
        { method: "GET" }
      );
      console.log(
        wantedDate.toISOString().split("T")[0].replace("-", "").replace("-", "")
      );
      let res = response.json();
      // Return the location of the ISS as GeoJSON.
      return res;
    } catch (err) {
      // If the updateSource interval is defined, clear the interval to stop updating the source.
      if (updateSource) clearInterval(updateSource);
      throw new Error(err);
    }
  }

  document.getElementById("slider").addEventListener("input", (e) => {
    const dayOffset = parseInt(e.target.value, 10);
    wantedDate.setDate(today.getDate() + dayOffset - 11);
    document.getElementById("day").innerHTML = `Date: ${
      wantedDate.getMonth() +
      1 +
      "/" +
      wantedDate.getDate() +
      "/" +
      wantedDate.getFullYear()
    }`;
  });

  map.on("click", "crops", (e) => {
      new mapboxgl.Popup({maxWidth: "none"})
        .setLngLat(e.lngLat)
        .setHTML(
          `<img src=${e.features[0].properties.image} width="300" height="200"><br><p>${e.features[0].properties.classification}</p>`
        )
        .addTo(map);
  });
});
//`<img src=${e.features[0].properties.image} width="500" height="600">`
/*
 * [
      'match',
      ['get', 'DATA_TYPE'], // Use the result 'DATA_TYPE' property
      'Disease',
      '##FF0000',
      'Weed',
      '#9ACD32',
      '#0000FF' // any other store type
    ]

    [
        'match',
        ['get', 'classification'],
        'Mosaic Disease',
        '#785C9C',
        'Bacterial Blight',
        '#5C839C',
        'Green Mite',
        '#00FF00',
        'Brown Streak Disease',
        '#915A17',
        '#000000'
    ]
*/
