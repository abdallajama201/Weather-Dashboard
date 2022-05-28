let searchform = $("#search-form");
let prevSearch = $("#prev-search");
let weather = $("#current-date");
let forecast = $("#5-day-forecast");
let forecastTitle= $("#forecast-title")

let weatherData;
let forecastData;

let today = dayjs();

function init() {
    searchform.children("button").on("click", getWeather)
}

// requests weather data
function getWeather(event) {
    event.preventDefault();

    let city = searchform.children("input").val();
    let requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;

    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.cod !== 404) {
                weatherData = data;
                displayWeather();
            }
        });
        
    requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
    
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.cod !== 404) {
                forecastData = data;
                displayForecast();
            }
        });    
    }
    
    // Display current day forecast
    function displayWeather() {
        let title = weather.children().eq(0).children("h2")
        let conditions = weather.children().eq(0).children("img");
        let temp = weather.children().eq(1);
        let wind = weather.children().eq(2);
        let humidity = weather.children().eq(3);
        let uvIndex = weather.children().eq(4);
        
        let city = weatherData.name;
        let date = today.format("MM/DD/YYYY");
        title.text(`${city} ${date}`);
        
        let icon = weatherData.weather[0].icon;
        conditions.attr("src",`https://openweathermap.org/img/w/${icon}.png`);
        temp.text(`Temp: ${Math.round(weatherData.main.temp)}°C`);
    wind.text(`Wind: ${Math.round((weatherData.wind.speed) * 3.6)} kph`);
    humidity.text(`Humidty: ${weatherData.main.humidity}%`);
}

// Display 5 day forecast
function displayForecast() {
    forecastTitle.css("visibility", "visible");
    // Loops through section and increments date displayed
    for(let i = 0; i < 5; i++) {
        let date = forecast.children().eq(i).children().eq(0);
        let conditions = forecast.children().eq(i).children("img");
        let temp = forecast.children().eq(i).children().eq(2);
        let wind = forecast.children().eq(i).children().eq(3);
        let hunidity = forecast.children().eq(i).children().eq(4);
        
        date.text(today.add((i + 1), "d").format("MM/DD/YYYY"));
        
        let icon = forecastData.list[(i * 8) + 4].weather[0].icon;
        conditions.attr("src",`https://openweathermap.org/img/w/${icon}.png`);
        temp.text(`Temp: ${Math.round(forecastData.list[(i * 8) + 4].main.temp)}°C`);
        wind.text(`Wind: ${Math.round((forecastData.list[(i * 8) + 4].wind.speed) * 3.6)} kph`);
        hunidity.text(`Humidity: ${forecastData.list[(i * 8) + 4].main.humidity}%`);
    }
}

init();