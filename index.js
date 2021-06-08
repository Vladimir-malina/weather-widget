const currentWeatherDiv = document.querySelector('.current-weather')
const forecast = document.querySelector('.forecast')
const userGeolocation = {}


function getUserGeolocation(weatherFunc) {
  const options = {
    enableHighAccuracy: true,
    timeout: 20000,
    maximumAge: 10
  };

  function success(pos) {
    userGeolocation.latitude = pos.coords.latitude;
    userGeolocation.longitude = pos.coords.longitude;
    weatherFunc();
  }

  function error(err) {
    alert(`Error ${err.code}: ${err.message}`)
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}


// -------------------------------------Current-weather-------------------------------------

async function getCurrentWeather () {
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?lat=${userGeolocation.latitude}&lon=${userGeolocation.longitude}&units=metric&appid=288394ddc13a106948cc1992aa4c2451`;
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const jsonResponse = await response.json();
      setCurrentWeather(jsonResponse);
      } else {
         throw new Error(`could not fetch ${endpoint}, received ${response.status}`)
      }
  } catch(error) {
    console.log(error)  
  }  
}

function setCurrentWeather(response) {
  const currentWeather = `<div class="current-weather">
      <div class="current-weather__location">Wheather in ${response.name}, ${response.sys.country}</div>
      <div class="current-weather__icon-temperature">
        <img class="current-weather__icon" src="http://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png"></img>
        <span class="current-weather__temperature">${response.main.temp} C°</span>
      </div>
      <div class="current-weather__phenomenon">${response.weather[0].description}</div>
      <div class="current-weather__date">
        <span class="current-weather__date_date">${new Date(response.dt*1000).toLocaleString(undefined , {hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'short'})}</span>
        <span class="current-weather__date_wrong"> Wrong data?</span>
      </div>

      <!------------------------------ CURRENT-WEATHER__Table ------------------------------>

      <table class="current-weather__table table" cellspacing="0" border="1"  cellpadding="10" width="300">
        <tr>
          <td>Wind</td>
          <td class="table__wind">${windDescription(response.wind.speed)}, ${response.wind.speed} m/s, ${degreeToCadinal(response.wind.speed)} (${response.wind.deg})</td>
        </tr>
        <tr>
          <td >Cloudiness</td>
          <td class="table__cloudiness">${cloudiness(response.clouds.all)}</td>
        </tr>
        <tr>
          <td >Pressure</td>
          <td class="table__pressure">${response.main.pressure} hpa</td>
        </tr>
        <tr>
          <td >Humidity</td>
          <td class="table__humidity">${response.main.humidity} %</td>
        </tr>
        <tr>
          <td >Sunrise</td>
          <td class="table__sunrise">${new Date(response.sys.sunrise*1000).toLocaleString(undefined, {hour: 'numeric', minute: 'numeric'})}</td>
        </tr>
        <tr>
          <td>Sunset</td>
          <td class="table__sunset">${new Date(response.sys.sunset*1000).toLocaleString(undefined, {hour: 'numeric', minute: 'numeric'})}</td>
        </tr>
        <tr>
          <td>Geo coords</td>
          <td class="table__geo-coords">[${Math.round(response.coord.lon*100)/100}, ${Math.round(response.coord.lat*100)/100}]</td>
        </tr>
      </table>
    </div>`
    currentWeatherDiv.insertAdjacentHTML("beforeend", currentWeather);
}

function cloudiness(cloudPerc) {
  if (!cloudPerc) return
  if (cloudPerc <= 5) return 'Clear'
  if (cloudPerc <= 25) return 'Mostly clear'
  if (cloudPerc <= 50) return 'Partly cloudy '
  if (cloudPerc <= 69) return 'Mostly cloudy'
  if (cloudPerc <= 87) return 'Considerable cloudiness'
  if (cloudPerc > 87 ) return 'Overcast'
}

function windDescription(speed) {
  if (!speed) return 
  if (speed <= 0.2) return 'Calm'
  if (speed <= 1.5) return 'Light Air'
  if (speed <= 3.3) return 'Light Breeze'
  if (speed <= 5.4) return 'Gentle Breeze'
  if (speed <= 7.9) return 'Moderate Breeze'
  if (speed <= 10.7) return 'Fresh Breeze'
  if (speed <= 13.8) return 'Strong Breeze'
  if (speed <= 17.1) return 'Near Gale'
  if (speed <= 20.7) return 'Gale'
  if (speed <= 24.4) return 'Strong Gale'
  if (speed <= 28.4) return 'Storm'
  if (speed <= 32.6) return 'Violent Storm'
  if (speed > 32.6 ) return 'Hurricane'
}

function degreeToCadinal(degree) {
  const value = Math.floor((degree / 22.5) + 0.5);
  const arr = ["North", "North-northeast", "Northeast", "East-northeast", "East", "East-southeast", "Southeast", "South-southeast", "South", "South-southwest", "Southwest", "West-southwest", "West", "West-northwest", "Northwest", "North-northwest"];
  return arr[(value % 16)]
}

getUserGeolocation(getCurrentWeather);


// -----------------------------------------------5-days__Weather-forecast-----------------------------------------------

async function getForecastWeather () {
  const endpoint = `https://api.openweathermap.org/data/2.5/forecast?lat=${userGeolocation.latitude}&lon=${userGeolocation.longitude}&units=metric&appid=288394ddc13a106948cc1992aa4c2451`;
  try {
    const response = await fetch(endpoint);
    if (response.ok) {
      const jsonResponse = await response.json();
      console.log(jsonResponse);
      renderForecast(jsonResponse);
    } else {
      throw new Error (`could not fetch ${endpoint}, received ${response.status}`)
    }
  } catch(error) {
    console.log(error)  
  }  
}

getUserGeolocation(getForecastWeather)

function renderForecast(response) {
  const forecastHeader = `<div class="forecast__location">Hourly weather and forecast in ${response.city.name}, ${response.city.country} </div>`;
  forecast.insertAdjacentHTML("beforeend", forecastHeader)
  const weatherList = response.list;
  weatherList.forEach(function (elem, i) {
    const time = new Date(elem.dt*1000);
    const hour = time.getHours();
    if ((hour <= 2) || (i == 0)) {
      renderDateDivs(time)
    }
    renderWeatherDivs(time, elem)
  })
}

function renderDateDivs (time) {
  const dayDiv = `<div class="day-div">${time.toLocaleString(undefined, {weekday: 'short', month: 'short', day:'numeric', year:'numeric'})} </div>`
  forecast.insertAdjacentHTML('beforeend', dayDiv);
}

function renderWeatherDivs(time, elem) {
  const weatherDiv = `
  <div class="weather-div">
    <div class="weather-div__left">
      <span class="weather-div__left_time">${time.toLocaleString(undefined, {hour: 'numeric', minute: 'numeric'})}</span>
      <img class="weather-div__left_pic" src="http://openweathermap.org/img/wn/${elem.weather[0].icon}@2x.png"> 
    </div>
    <div class="weather-div__right">
      <div class="weather-div__right_top">
        <span class="weather-div__right_temperature">${elem.main.temp} C°</span>
        <span class="weather-div__right_phenomenon">${elem.weather[0].description}</span>
      </div>
      <div class="weather-div__right_bottom">${elem.wind.speed} m/s, clouds: ${elem.clouds.all}%, ${elem.main.pressure} hpa</div>
    </div>
  </div>`

  forecast.insertAdjacentHTML("beforeend" ,weatherDiv);
}

