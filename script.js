const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const weatherInfoContainer = document.querySelector(".weather-info-conatiner");
const grantAccessContainer = document.querySelector(".permission-container");
const searchForm = document.querySelector("[data-searchForm]");
const searchInput = document.querySelector("[data-searchInput]");
const apiErrorContainer = document.querySelector(".api-error-container");
const loadingScreen = document.querySelector(".loading-screen-container");
const API_key = "2f68f7f4479e2f7797ac632844359692";


// Tab handling
let currentTab = userTab;
currentTab.classList.add("current-tab");
getFromSessionStorage();

userTab.addEventListener('click', function () {
    switchTab(userTab);
})

searchTab.addEventListener('click', function () {
    switchTab(searchTab);
})

function switchTab (clickedTab) {
    if (clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            weatherInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        } else {
            searchForm.classList.remove("active");
            weatherInfoContainer.classList.remove("active");
            // We have to display user's curr weather if we have saved it before so we'll check from
            // session storage and show it
            getFromSessionStorage(); 
        }
    }
}

// Check if we have user's current coordinates or not
function getFromSessionStorage () {
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if (!localCoordinates) { // agar coordinates nhi hai
        grantAccessContainer.classList.add("active");
    } else { // agar coordinates hai to weather info show kardo
        const coordinates = JSON.parse(localCoordinates);
        fetchWeatherInfo(coordinates);
    }
}

// Fetching Weather Information
async function fetchWeatherInfo (coordinates) {
    const lat = coordinates.lat;
    const lon = coordinates.lon;

    // Make Permission Container Invisible
    grantAccessContainer.classList.remove("active");

    // Make loader appear
    loadingScreen.classList.add("active");

    // Call API
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}`);
        const data = await response.json(); 
        loadingScreen.classList.remove("active");
        weatherInfoContainer.classList.add("active");
        renderWeatherInfo(data); // render the weather info
    } 
    catch(e) {
        loadingScreen.classList.remove("active");
    }
}

// Rendering the weather information
function renderWeatherInfo (weatherInfo) {
    // Variable needed to render the weather info
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-clouds]");

    // Fetching and Rendering weather Info
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.main;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${((weatherInfo?.main?.temp) - 273.15).toFixed(2)} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed.toFixed(2)}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

// Grant Location Permission 
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        grantAccessBtn.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchWeatherInfo(userCoordinates);
}

const grantAccessBtn = document.querySelector("[data-grantAccess]");
grantAccessBtn.addEventListener('click', getLocation);

// Search Form 
searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName == "") {
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo (city) {
    loadingScreen.classList.add("active");
    weatherInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}`);
        const data = await response.json();
        if (!data.sys) {
          throw data;
        }
        loadingScreen.classList.remove("active");
        weatherInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    } catch (error) {
        //
    }
}
