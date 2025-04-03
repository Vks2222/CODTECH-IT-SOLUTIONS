const apiKey = 'fd71d2548b060680466bfb0329e1a74a'; 

// Listen for button clicks to fetch weather
document.getElementById('getWeather').addEventListener('click', function() {
    const city = document.getElementById('cityInput').value.trim();
    if (!city) {
        document.getElementById('weatherDisplay').innerHTML = '<p>Please enter a city name.</p>';
        return;
    }
    fetchWeatherByCity(city);
});

// Use geolocation to get weather based on current location
document.getElementById('useLocation').addEventListener('click', function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeatherByCoords(latitude, longitude);
            },
            (error) => {
                document.getElementById('weatherDisplay').innerHTML = `<p>Location access denied. Please enter a city manually.</p>`;
            }
        );
    } else {
        document.getElementById('weatherDisplay').innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
    }
});

// Fetch weather by city name
function fetchWeatherByCity(city) {
    const geoApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    fetch(geoApiUrl)
        .then(response => response.json())
        .then(locationData => {
            if (!locationData || locationData.length === 0) {
                throw new Error('City not found. Please enter a valid city name.');
            }
            const { lat, lon } = locationData[0];
            fetchWeatherByCoords(lat, lon);
        })
        .catch(error => {
            document.getElementById('weatherDisplay').innerHTML = `<p>${error.message}</p>`;
        });
}

// Fetch weather based on coordinates (latitude, longitude)
function fetchWeatherByCoords(lat, lon) {
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    const currentTime = new Date().toLocaleString(); // Get the current time when the data is fetched

    fetch(weatherApiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch weather data.');
            }
            return response.json();
        })
        .then(data => {
            const weatherInfo = `
                <p>Temperature: ${data.main.temp}°C</p>
                <p>Weather: ${data.weather[0].description}</p>
                <p>Humidity: ${data.main.humidity}%</p>
                <p>Wind Speed: ${data.wind.speed} m/s</p>
            `;
            
            document.getElementById('weatherDisplay').innerHTML = weatherInfo;
            document.getElementById('weatherIcon').innerHTML = getWeatherIcon(data.weather[0].main.toLowerCase());
            document.body.style.backgroundImage = `url('${getBackgroundImage(data.weather[0].main.toLowerCase())}')`;

            // Show the time when the weather info was fetched
            document.getElementById('updateTime').innerHTML = `<p>Last updated at: ${currentTime}</p>`;

            // Fetch hourly and weekly forecast data (every 3 hours)
            fetch(forecastApiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch forecast data.');
                    }
                    return response.json();
                })
                .then(forecastData => {
                    displayHourlyForecast(forecastData);
                    displayWeeklyForecast(forecastData);
                })
                .catch(error => {
                    document.getElementById('hourlyWeather').innerHTML = `<p>Error fetching hourly forecast.</p>`;
                    document.getElementById('weeklyWeather').innerHTML = `<p>Error fetching weekly forecast.</p>`;
                });
        })
        .catch(error => {
            document.getElementById('weatherDisplay').innerHTML = `<p>Error fetching weather data: ${error.message}</p>`;
        });
}

// Display hourly forecast
function displayHourlyForecast(data) {
    const hourlyData = data.list.slice(0, 8); // Get next 8 hours
    let hourlyHtml = '<h3>Hourly Forecast (Next 8 Hours)</h3>';
    let hourlyBoxes = '';

    hourlyData.forEach(hour => {
        const time = new Date(hour.dt * 1000).toLocaleTimeString();
        const temp = hour.main.temp;
        const description = hour.weather[0].description;
        const icon = getWeatherIcon(hour.weather[0].main.toLowerCase());
        hourlyBoxes += `
            <div class="forecast-box">
                <h4>${time}</h4>
                <div class="weather-icon">${icon}</div>
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    });

    document.getElementById('hourlyWeather').innerHTML = hourlyHtml + hourlyBoxes;
}

// Display weekly forecast
function displayWeeklyForecast(data) {
    const dailyData = data.list.filter((entry, index) => index % 8 === 0); // Filter daily data (every 8th entry)
    let weeklyHtml = '<h3>Weekly Forecast</h3>';
    let weeklyBoxes = '';

    dailyData.forEach(day => {
        const dayName = new Date(day.dt * 1000).toLocaleString('en-us', { weekday: 'long' });
        const temp = day.main.temp;
        const description = day.weather[0].description;
        const icon = getWeatherIcon(day.weather[0].main.toLowerCase());
        weeklyBoxes += `
            <div class="forecast-box">
                <h4>${dayName}</h4>
                <div class="weather-icon">${icon}</div>
                <p>${temp}°C</p>
                <p>${description}</p>
            </div>
        `;
    });

    document.getElementById('weeklyWeather').innerHTML = weeklyHtml + weeklyBoxes;
}

// Function to get background image based on weather condition
function getBackgroundImage(condition) {
    const weatherImages = {
        clear: 'https://wallpapercave.com/wp/wp6680232.jpg',
        clouds: 'https://t4.ftcdn.net/jpg/05/76/71/09/360_F_576710966_O38QFCqtl23ADMCXNbiskTqmNTR4VK0Q.jpg',
        rain: 'https://www.vmcdn.ca/f/files/via/images/weather/rain-umbrella-vancouver-weather.jpg;w=960',
        snow: 'https://tse3.mm.bing.net/th?id=OIP.YWE-slxtTvJeGkohuQH-4AHaEK&pid=Api&P=0&h=180',
        thunderstorm: 'https://www.thoughtco.com/thmb/KempzxGFcb8FXt7JN2G43_CSqE8=/3600x2400/filters:fill(auto,1)/GettyImages-605383007-5728164c3df78ced1f3a2015.jpg',
        mist: 'https://tse3.mm.bing.net/th?id=OIP.9cZf3_8ThrNSIbDamvw7WgHaE8&pid=Api&P=0&h=180',
    };
    return weatherImages[condition] || 'https://t3.ftcdn.net/jpg/02/11/52/42/360_F_211524227_Ett8aboQvVnROAFtqu3S1pW99Y3Th9vm.jpg';
}

// Function to get weather icon based on condition
function getWeatherIcon(condition) {
    const icons = {
        clear: '☀️',
        clouds: '☁️',
        rain: '🌧️',
        snow: '❄️',
        thunderstorm: '⛈️',
        mist: '🌫️',
    };
    return icons[condition] || '🌍';
}

// Start voice search functionality
function startVoiceSearch() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('cityInput').value = transcript;
            fetchWeatherByCity(transcript); // Fetch weather based on voice input
        };

        recognition.onerror = function(event) {
            console.error('Voice recognition error:', event.error);
        };

        recognition.onend = function() {
            console.log('Voice recognition ended.');
        };
    } else {
        alert('Your browser does not support voice recognition.');
    }
}
