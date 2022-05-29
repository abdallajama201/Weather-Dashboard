let searchform = $("#search-form");
let prevSearch = $("#prev-search");
let weather = $("#current-date");
let forecast = $("#5-day-forecast");
let forecastTitle= $("#forecast-title")

let weatherData;
let forecastData;
let isClearing = false;
let clearMessageCode;

// Container for individual dates weather
class ClimateData {
    constructor(date, conditions, temp, wind, humidity) {
        this.date = date;
        this.conditions = conditions;
        this.temp = temp;
        this.wind = wind;
        this.humidity = humidity;
    }
}

// Container for cities total data
class CityData {
    constructor(city, weather, forecast) {
        this.city = city;
        this.weather = weather;
        this.forecast = forecast;
    }
}

let currentCity = new CityData();
let weatherStorage = [];
let forecastStorage = [];

// Set the day
let today = dayjs();

function init() {
    searchform.children("button").on("click", getClimate)
}

// requests climate data
function getClimate(event) {
    event.preventDefault();

    let city = searchform.children("input").val();
    let requestUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
    fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.cod !== "404" && data.cod !== "400") {
                weatherData = data;
                //REMOVE
                console.log(weatherData);
                packageWeather();
            }
        });
        
        requestUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=5911de58d825147b5fa891cd55dfb5c0&units=metric`;
        fetch(requestUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if(data.cod !== "404" && data.cod !== "400") {
                forecastData = data;
                //REMOVE
                console.log(forecastData);
                packageForecast();
            } else {
                invalidInput(data.message);
            }
        });

}

// Handles an bad response from API
// Displays the message returned from API
function invalidInput(message) {
    if(!isClearing) {
        let messageSpace = $("<p>");
        messageSpace.text(message);
        messageSpace.css("color", "red");
        searchform.append(messageSpace); 
        clearAnswer();  
    } else {
        clearAnswer();
    }
}

// Clears the invalid input message
// Checks if a timeout has already been set
// If it has it clears the previous timeout and calls itself
function clearAnswer() {
    if(isClearing) {
        isClearing = false;
        clearTimeout(clearMessageCode);
        clearAnswer();
    } else {
        isClearing = true;
        clearMessageCode = setTimeout(function() {
            searchform.children().eq(3).remove();
            isClearing = false;
        }, 1500);
    }
}

// Packages weather data into an object
// The object contains only the relevant data
function packageWeather() {
    let city = weatherData.name;
    let date = today.format("MM/DD/YYYY");
    let conditions = weatherData.weather[0].icon;
    let temp = Math.round(weatherData.main.temp);
    let wind = Math.round((weatherData.wind.speed) * 3.6);
    let humidity = weatherData.main.humidity;
    
    let weather = new ClimateData(date, conditions, temp, wind, humidity);
    
    currentCity.city = city;
    currentCity.weather = weather;

    displayWeather(currentCity.weather);
    saveClimate(currentCity);
}

// Displays weather in html
function displayWeather(current) {
    let title = weather.children().eq(0).children("h2")
    let conditions = weather.children().eq(0).children("img");
    let temp = weather.children().eq(1);
    let wind = weather.children().eq(2);
    let humidity = weather.children().eq(3);
    let uvIndex = weather.children().eq(4);
    
    title.text(`${currentCity.city} ${today.format("MM/DD/YYYY")}`);
    conditions.attr("src",`https://openweathermap.org/img/w/${current.conditions}.png`);
    temp.text(`Temp: ${current.temp}°C`);
    wind.text(`Wind: ${current.wind} kph`);
    humidity.text(`Humidty: ${current.humidity}%`);
}

// Packages forescast data into objects
// objects are placed in currentCity
function packageForecast() {
    let forecast = [];
    
    for(let i = 0; i < 5; i++) {
        let date = today.add((i + 1), "d").format("MM/DD/YYYY"); 
        let conditions = forecastData.list[(i * 8) + 4].weather[0].icon;
        
        // Calculating the averages by looping through all 8 values 
        let averageTemp = 0;
        let averageWind = 0;
        let averageHumidity = 0;
        for(let j = 0; j < 8; j++) {
            averageTemp += forecastData.list[(i * 8) + j].main.temp;
            averageWind += (forecastData.list[(i * 8) + j].wind.speed * 3.6);
            averageHumidity += forecastData.list[(i * 8) + j].main.humidity;
        }
        averageTemp = Math.round(averageTemp / 8);
        averageWind = Math.round(averageWind / 8);
        averageHumidity = Math.round(averageHumidity / 8);
        
        let temp = averageTemp;
        let wind = averageWind;
        let humidity = averageHumidity;
        
        let daily = new ClimateData(date, conditions, temp, wind, humidity);
        forecast.push(daily);
    }
    currentCity.forecast = forecast;

    displayForecast(currentCity.forecast);
}

// Displays forecast in html
function displayForecast(current) {
    forecastTitle.css("visibility", "visible");
    for(let i = 0; i < 5; i++) {
        let date = forecast.children().eq(i).children().eq(0);
        let conditions = forecast.children().eq(i).children("img");
        let temp = forecast.children().eq(i).children().eq(2);
        let wind = forecast.children().eq(i).children().eq(3);
        let humidity = forecast.children().eq(i).children().eq(4);

        date.text(current[i].date);
        conditions.attr("src",`https://openweathermap.org/img/w/${current[i].conditions}.png`);
        temp.text(`Temp: ${current[i].temp}°C`);
        wind.text(`Wind: ${current[i].wind} kph`);
        humidity.text(`Humidity: ${current[i].humidity}%`);
    }
}

// Saves the data for a city
function saveClimate(current) {
    weatherStorage.reverse();
    weatherStorage.push(current);
    weatherStorage.reverse();

    while(weatherStorage.length > 10) {
        weatherStorage.pop();
    }
    console.log(weatherStorage);
}

init();