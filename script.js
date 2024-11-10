// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC65GJkshJfXntiRltvGMC4c2moQ6vc8iE",
  authDomain: "malaysia-tourism.firebaseapp.com",
  databaseURL:
    "https://malaysia-tourism-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "malaysia-tourism",
  storageBucket: "malaysia-tourism.appspot.com",
  messagingSenderId: "367718152198",
  appId: "1:367718152198:web:44407bcd9a18ab5781ab87",
  measurementId: "G-LK42X5BXYS",
};

// Global variables
let tourist_spot_data = null;
let tourist_spot_data_manipulate = null;
let map, mapEvent;
let arr_of_markers = [];

const app = initializeApp(firebaseConfig); // Initialize Firebase
const database = getDatabase(app); // Initialize Realtime Database

const touristSpotRef = ref(database, "TouristSpot"); // Reference to the "TouristSpot" node

// DOM Elements
const details = document.querySelector(".details");
const input_tourist_spot_name = document.getElementById(
  "input_tourist_spot_name"
);
const dropdown_menu = document.getElementById("dropdown_menu");
const modal = document.getElementById("myModal");
const btn_change_map_style = document.querySelector(".btn_change_map_style");
const closeModalBtn = document.getElementById("closeModal");
const img_OpenTopoMap = document.getElementById("img_OpenTopoMap");
const img_OpenStreetMap_standard = document.getElementById(
  "img_OpenStreetMap_standard"
);
const img_EsriSatellite = document.getElementById("img_EsriSatellite");

// Function to fetch data once and store it
function fetchTouristSpotData() {
  return new Promise((resolve, reject) => {
    // Use `get()` instead of `onValue` to fetch data only once
    get(touristSpotRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          tourist_spot_data = snapshot.val(); // Store the data in the global variable
          console.log("Data fetched successfully:", tourist_spot_data);

          // Convert object to an array of objects without Firebase keys
          tourist_spot_data = Object.values(tourist_spot_data);

          // Create a copy of tourist spot data
          tourist_spot_data_manipulate = [...tourist_spot_data];
          console.log(tourist_spot_data_manipulate);
          resolve(); // Resolve promise when data is fetched
        } else {
          console.log("No data available");
          reject("No data available");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        reject(error); // Reject the promise on error
      });
  });
}

function displayAllMarkers() {
  if (tourist_spot_data_manipulate) {
    for (const curr_tourist_spot of tourist_spot_data_manipulate) {
      console.log("Name:", curr_tourist_spot.name);
      console.log("Coordinates:", curr_tourist_spot.coordinates);

      const [latitude, longitude] = curr_tourist_spot.coordinates
        .split(",")
        .map(Number);

      let marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup(
          L.popup({
            maxWidth: 250,
            minWidth: 100,
          })
        )
        .setPopupContent(curr_tourist_spot.name)
        .openPopup();

      arr_of_markers.push(marker);
    }
  } else {
    console.log("No tourist spot data available.");
  }
}

function removeMarkers() {
  for (var i = 0; i < arr_of_markers.length; i++) {
    map.removeLayer(arr_of_markers[i]);
  }
  arr_of_markers = []; // Clear the array after removing markers
}

// When the user press the enter key when typing something in the input_tennant_ic text field
input_tourist_spot_name.addEventListener("keydown", function (event) {
  // Check if the user pressed the Enter key
  if (event.key == "Enter") {
    // Get the input value
    let name = input_tourist_spot_name.value;
    name = name.toLowerCase();

    console.log(name);

    // Clear the array first
    tourist_spot_data_manipulate.length = 0;

    // Find the object where its "ic" property is equal to the input provided by the user
    for (const curr_tourist_spot of tourist_spot_data) {
      console.log(name, curr_tourist_spot.name.toLowerCase());

      if (curr_tourist_spot.name.toLowerCase() == name) {
        tourist_spot_data_manipulate.push(curr_tourist_spot);
      }
    }

    console.log(tourist_spot_data_manipulate);

    removeMarkers();
    displayAllMarkers();
  }
});

// When the user select one of the items from the dropdown menu
dropdown_menu.addEventListener("change", function () {
  const selected_state = dropdown_menu.value;
  console.log(selected_state);

  // Clear the array
  tourist_spot_data_manipulate.length = 0;

  // Use spread operator to make a shallow copy of an array
  // arr_filtered_data = [...arr_of_tennant];

  // prettier-ignore
  if (selected_state == 'All') {
    tourist_spot_data_manipulate = [...tourist_spot_data];
  }
  else {
    for(const curr_tourist_spot of tourist_spot_data){
        if(curr_tourist_spot.state == selected_state){
            tourist_spot_data_manipulate.push(curr_tourist_spot);
        }
    }
  }

  console.log(tourist_spot_data_manipulate);

  removeMarkers();
  displayAllMarkers();
});

// Open modal on button click
btn_change_map_style.addEventListener("click", function (event) {
  modal.style.display = "flex";
});

// Close modal on close button click
closeModalBtn.addEventListener("click", function (event) {
  modal.style.display = "none";
});

// Close modal when clicking outside of modal content
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
});

// When the user click Open Street Map (Standard) image
img_OpenStreetMap_standard.addEventListener("click", function () {
  // Remove existing layers
  map.eachLayer((l) => map.removeLayer(l));

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: "© OpenTopoMap contributors",
  }).addTo(map);

  removeMarkers();
  displayAllMarkers();

  modal.style.display = "none";
});

// When the user click Open Topo Map image
img_OpenTopoMap.addEventListener("click", function () {
  // Remove existing layers
  map.eachLayer((l) => map.removeLayer(l));

  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 17,
    attribution: "© OpenTopoMap contributors",
  }).addTo(map);

  removeMarkers();
  displayAllMarkers();

  modal.style.display = "none";
});

// When the user click Esri Satellite image
img_EsriSatellite.addEventListener("click", function () {
  // Remove existing layers
  map.eachLayer((l) => map.removeLayer(l));

  L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      maxZoom: 17,
      attribution: "© Esri & the GIS User Community",
    }
  ).addTo(map);

  removeMarkers();
  displayAllMarkers();

  modal.style.display = "none";
});

function success(position) {
  // Destructure latitude and longitude
  const { latitude } = position.coords;
  const { longitude } = position.coords;

  map = L.map("map").setView([latitude, longitude], 13);

  // The map being displayed, is made up of tiles. And the tiles comes from this url below
  // We can change the url below, to change the appearance of the map
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Display all markers
  displayAllMarkers();
}

// When Geolocation fails to get user's current location
function fail() {
  alert("Could not get your position.");
}

// Check if navigator exists (older browsers don't support navigator)
// prettier-ignore
fetchTouristSpotData()
    .then(() => {
        // If data is fetched successfully, attempt to get the user's location
           if (navigator.geolocation) {
               navigator.geolocation.getCurrentPosition(success, fail);
           } 
           else {
               alert("Geolocation is not supported by this browser.");
           }
       })
       .catch((error) => {
           console.error(error);
       });
