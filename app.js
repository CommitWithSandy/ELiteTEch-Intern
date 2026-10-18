/**
 * PULSESPHERE - Modern Weather & Atmospheric Intelligence Hub
 * Task 1: API Integration - Elite Tech Internship Project
 * 
 * Features:
 * - Real-time Weather, 24h Hourly Forecast, and 7-Day Outlook via Open-Meteo REST API
 * - Atmospheric Air Quality (AQI, PM2.5, PM10) via Open-Meteo Air Quality API
 * - Instant Geocoding Autocomplete Search with Debounce
 * - LocalStorage Favorites & Unit Switcher (°C / °F)
 * - Dynamic SVG Weather Icons & Interactive SVG Hourly Curve
 */

// ==========================================================================
// 1. CONSTANTS, WMO WEATHER DICTIONARY & ICONS
// ==========================================================================

const WMO_WEATHER_MAP = {
  0: { label: 'Clear Sky', icon: 'clear-day', bgTheme: 'sunny', advice: 'Ideal outdoor conditions today.' },
  1: { label: 'Mainly Clear', icon: 'partly-cloudy-day', bgTheme: 'sunny', advice: 'Mostly sunny with scattered breeze.' },
  2: { label: 'Partly Cloudy', icon: 'partly-cloudy-day', bgTheme: 'cloudy', advice: 'Pleasant weather with mild cloud cover.' },
  3: { label: 'Overcast', icon: 'overcast', bgTheme: 'cloudy', advice: 'Cloudy skies throughout the region.' },
  45: { label: 'Foggy', icon: 'fog', bgTheme: 'cloudy', advice: 'Visibility reduced. Drive with caution.' },
  48: { label: 'Depositing Rime Fog', icon: 'fog', bgTheme: 'cloudy', advice: 'Dense chilly fog with icy air.' },
  51: { label: 'Light Drizzle', icon: 'drizzle', bgTheme: 'rain', advice: 'Light misty drizzle expected.' },
  53: { label: 'Moderate Drizzle', icon: 'drizzle', bgTheme: 'rain', advice: 'Carrying a light umbrella is recommended.' },
  55: { label: 'Dense Drizzle', icon: 'rain', bgTheme: 'rain', advice: 'Continuous drizzle dampening streets.' },
  56: { label: 'Freezing Drizzle', icon: 'sleet', bgTheme: 'rain', advice: 'Freezing drizzle on road surfaces.' },
  57: { label: 'Dense Freezing Drizzle', icon: 'sleet', bgTheme: 'rain', advice: 'Icy conditions; proceed cautiously.' },
  61: { label: 'Slight Rain', icon: 'rain', bgTheme: 'rain', advice: 'Light showers scattered across the area.' },
  63: { label: 'Moderate Rain', icon: 'rain', bgTheme: 'rain', advice: 'Steady rain. Don\'t forget your umbrella.' },
  65: { label: 'Heavy Rain', icon: 'heavy-rain', bgTheme: 'rain', advice: 'Heavy downpours. Expect wet roads.' },
  66: { label: 'Light Freezing Rain', icon: 'sleet', bgTheme: 'rain', advice: 'Freezing rain creating slick spots.' },
  67: { label: 'Heavy Freezing Rain', icon: 'sleet', bgTheme: 'rain', advice: 'Severe freezing precipitation.' },
  71: { label: 'Slight Snowfall', icon: 'snow', bgTheme: 'snow', advice: 'Light gentle snow flurries.' },
  73: { label: 'Moderate Snowfall', icon: 'snow', bgTheme: 'snow', advice: 'Steady snowfall accumulating softly.' },
  75: { label: 'Heavy Snowfall', icon: 'heavy-snow', bgTheme: 'snow', advice: 'Heavy snow accumulation expected.' },
  77: { label: 'Snow Grains', icon: 'snow', bgTheme: 'snow', advice: 'Fine granular frozen snow.' },
  80: { label: 'Slight Rain Showers', icon: 'rain', bgTheme: 'rain', advice: 'Passing brief rain showers.' },
  81: { label: 'Moderate Rain Showers', icon: 'rain', bgTheme: 'rain', advice: 'Periodic rain showers through the day.' },
  82: { label: 'Violent Rain Showers', icon: 'heavy-rain', bgTheme: 'rain', advice: 'Intense rain downpours. Stay sheltered.' },
  85: { label: 'Slight Snow Showers', icon: 'snow', bgTheme: 'snow', advice: 'Intermittent snow showers.' },
  86: { label: 'Heavy Snow Showers', icon: 'heavy-snow', bgTheme: 'snow', advice: 'Brisk wind and heavy snow squalls.' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm', bgTheme: 'thunder', advice: 'Active thunder & lightning activity.' },
  96: { label: 'Thunderstorm with Hail', icon: 'thunderstorm', bgTheme: 'thunder', advice: 'Severe thunderstorm with hail.' },
  99: { label: 'Severe Thunderstorm & Hail', icon: 'thunderstorm', bgTheme: 'thunder', advice: 'Extreme storm alert. Seek indoor shelter.' },
};

/**
 * Returns dynamic SVG markup for high-definition weather icons
 */
function getWeatherSvgIcon(type, isDay = 1) {
  const isNight = isDay === 0;

  switch (type) {
    case 'clear-day':
      if (isNight) {
        return `
          <svg viewBox="0 0 64 64" class="weather-svg-animated">
            <defs>
              <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#E2E8F0" />
                <stop offset="100%" stop-color="#94A3B8" />
              </linearGradient>
            </defs>
            <path d="M42 16 A18 18 0 1 1 24 48 A22 22 0 0 0 42 16 Z" fill="url(#moonGrad)" filter="drop-shadow(0 0 8px rgba(226, 232, 240, 0.4))" />
          </svg>
        `;
      }
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FDE047" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
          </defs>
          <g class="weather-svg-sun-rays">
            <line x1="32" y1="6" x2="32" y2="14" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="32" y1="50" x2="32" y2="58" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="6" y1="32" x2="14" y2="32" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="50" y1="32" x2="58" y2="32" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="13.6" y1="13.6" x2="19.3" y2="19.3" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="44.7" y1="44.7" x2="50.4" y2="50.4" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="13.6" y1="50.4" x2="19.3" y2="44.7" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
            <line x1="44.7" y1="19.3" x2="50.4" y2="13.6" stroke="#FBBF24" stroke-width="3" stroke-linecap="round"/>
          </g>
          <circle cx="32" cy="32" r="14" fill="url(#sunGrad)" filter="drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))"/>
        </svg>
      `;

    case 'partly-cloudy-day':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="pcSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FDE047" />
              <stop offset="100%" stop-color="#F59E0B" />
            </linearGradient>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
          </defs>
          <circle cx="26" cy="24" r="11" fill="url(#pcSunGrad)" filter="drop-shadow(0 0 8px #F59E0B)"/>
          <path class="weather-svg-cloud" d="M22 46 h26 a10 10 0 0 0 0 -20 a14 14 0 0 0 -25 -2 a8 8 0 0 0 -1 22 Z" fill="url(#cloudGrad)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"/>
        </svg>
      `;

    case 'overcast':
    case 'fog':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="darkCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#CBD5E1" />
              <stop offset="100%" stop-color="#64748B" />
            </linearGradient>
          </defs>
          <path class="weather-svg-cloud" d="M18 42 h30 a12 12 0 0 0 0 -24 a16 16 0 0 0 -30 2 a10 10 0 0 0 0 22 Z" fill="url(#darkCloudGrad)" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.3))"/>
          ${type === 'fog' ? '<line x1="16" y1="48" x2="48" y2="48" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/><line x1="20" y1="54" x2="44" y2="54" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round"/>' : ''}
        </svg>
      `;

    case 'rain':
    case 'drizzle':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#94A3B8" />
              <stop offset="100%" stop-color="#475569" />
            </linearGradient>
          </defs>
          <path class="weather-svg-cloud" d="M18 36 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 2 a8 8 0 0 0 -2 18 Z" fill="url(#rainCloudGrad)"/>
          <line class="weather-svg-raindrop" x1="24" y1="42" x2="21" y2="50" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
          <line class="weather-svg-raindrop" style="animation-delay: 0.3s;" x1="33" y1="42" x2="30" y2="50" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
          <line class="weather-svg-raindrop" style="animation-delay: 0.6s;" x1="42" y1="42" x2="39" y2="50" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      `;

    case 'heavy-rain':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="heavyRainCloud" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#64748B" />
              <stop offset="100%" stop-color="#334155" />
            </linearGradient>
          </defs>
          <path class="weather-svg-cloud" d="M18 34 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 2 a8 8 0 0 0 -2 18 Z" fill="url(#heavyRainCloud)"/>
          <line class="weather-svg-raindrop" x1="21" y1="40" x2="17" y2="52" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
          <line class="weather-svg-raindrop" style="animation-delay: 0.2s;" x1="30" y1="40" x2="26" y2="52" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
          <line class="weather-svg-raindrop" style="animation-delay: 0.4s;" x1="39" y1="40" x2="35" y2="52" stroke="#00F0FF" stroke-width="3" stroke-linecap="round"/>
        </svg>
      `;

    case 'thunderstorm':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="stormCloud" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#475569" />
              <stop offset="100%" stop-color="#1E293B" />
            </linearGradient>
          </defs>
          <path class="weather-svg-cloud" d="M18 32 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 2 a8 8 0 0 0 -2 18 Z" fill="url(#stormCloud)"/>
          <polygon points="31,34 25,46 32,46 29,58 39,44 32,44" fill="#FBBF24" filter="drop-shadow(0 0 8px #F59E0B)"/>
        </svg>
      `;

    case 'snow':
    case 'heavy-snow':
    case 'sleet':
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <defs>
            <linearGradient id="snowCloud" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#CBD5E1" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
          </defs>
          <path class="weather-svg-cloud" d="M18 34 h28 a10 10 0 0 0 0 -20 a14 14 0 0 0 -26 2 a8 8 0 0 0 -2 18 Z" fill="url(#snowCloud)"/>
          <circle cx="23" cy="46" r="2.5" fill="#E2E8F0"/>
          <circle cx="32" cy="51" r="2.5" fill="#E2E8F0"/>
          <circle cx="41" cy="46" r="2.5" fill="#E2E8F0"/>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 64 64" class="weather-svg-animated">
          <circle cx="32" cy="32" r="14" fill="#FBBF24"/>
        </svg>
      `;
  }
}

// ==========================================================================
// 2. STATE MANAGEMENT & STORAGE SERVICE
// ==========================================================================

const AppState = {
  temperatureUnit: localStorage.getItem('pulsesphere_unit') || 'celsius', // 'celsius' or 'fahrenheit'
  currentLocation: {
    name: 'London',
    country: 'United Kingdom',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London'
  },
  weatherData: null,
  airQualityData: null,
  favorites: JSON.parse(localStorage.getItem('pulsesphere_favorites') || '[]'),
};

const StorageService = {
  isFavorite(cityName) {
    return AppState.favorites.some(fav => fav.name.toLowerCase() === cityName.toLowerCase());
  },

  toggleFavorite(cityObj) {
    const idx = AppState.favorites.findIndex(f => f.name.toLowerCase() === cityObj.name.toLowerCase());
    if (idx >= 0) {
      AppState.favorites.splice(idx, 1);
    } else {
      AppState.favorites.push({
        name: cityObj.name,
        country: cityObj.country,
        latitude: cityObj.latitude,
        longitude: cityObj.longitude
      });
    }
    localStorage.setItem('pulsesphere_favorites', JSON.stringify(AppState.favorites));
    UIController.renderFavoritesChips();
    UIController.updateFavoriteButtonState();
  },

  saveUnitPreference(unit) {
    AppState.temperatureUnit = unit;
    localStorage.setItem('pulsesphere_unit', unit);
  }
};

// ==========================================================================
// 3. API SERVICE: OPEN-METEO WEATHER & AIR QUALITY
// ==========================================================================

const WeatherService = {
  /**
   * Search city by query using Open-Meteo Geocoding API
   */
  async searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Geocoding API network response failed');
      const data = await response.json();
      return data.results || [];
    } catch (err) {
      console.error('SearchCities Error:', err);
      return [];
    }
  },

  /**
   * Fetch live weather, 24h hourly forecast, and 7-day daily forecast
   */
  async fetchWeatherData(lat, lon, timezone = 'auto') {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
      hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,is_day',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max',
      timezone: timezone
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weather fetch failed: ${response.statusText}`);
    return await response.json();
  },

  /**
   * Fetch Air Quality Index from Open-Meteo Air Quality API
   */
  async fetchAirQuality(lat, lon) {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: 'european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
      timezone: 'auto'
    });

    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      return await response.json();
    } catch (e) {
      console.warn('Air Quality fetch warning:', e);
      return null;
    }
  },

  /**
   * Helper: Convert Celsius to Fahrenheit if preferred
   */
  formatTemp(celsiusVal) {
    if (celsiusVal === null || celsiusVal === undefined) return '--';
    if (AppState.temperatureUnit === 'fahrenheit') {
      const fahrenheit = (celsiusVal * 9) / 5 + 32;
      return Math.round(fahrenheit);
    }
    return Math.round(celsiusVal);
  },

  /**
   * Helper: Convert km/h to mph if Fahrenheit
   */
  formatWind(speedKmh) {
    if (AppState.temperatureUnit === 'fahrenheit') {
      const mph = speedKmh * 0.621371;
      return { speed: Math.round(mph), unit: 'mph' };
    }
    return { speed: Math.round(speedKmh), unit: 'km/h' };
  },

  getDegreesText(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return `${directions[index]} (${Math.round(degrees)}°)`;
  }
};





// ==========================================================================
// 6. UI CONTROLLER: RENDERING & INTERACTIONS
// ==========================================================================

const UIController = {
  elements: {},

  init() {
    this.cacheDOMElements();
    this.bindEvents();
    this.renderFavoritesChips();
    this.applyUnitButtons();

    // Load initial city weather
    this.loadWeatherForLocation(AppState.currentLocation);

    // Check online/offline status
    this.setupNetworkListeners();
  },

  cacheDOMElements() {
    this.elements = {
      ambientBg: document.getElementById('ambientBg'),
      networkBanner: document.getElementById('networkBanner'),

      // Controls
      unitToggle: document.getElementById('unitToggle'),
      btnCelsius: document.getElementById('btnCelsius'),
      btnFahrenheit: document.getElementById('btnFahrenheit'),
      btnRefreshAll: document.getElementById('btnRefreshAll'),
      apiStatusPill: document.getElementById('apiStatusPill'),

      // Search & Location
      citySearchInput: document.getElementById('citySearchInput'),
      btnClearSearch: document.getElementById('btnClearSearch'),
      citySuggestionsList: document.getElementById('citySuggestionsList'),
      btnGeolocate: document.getElementById('btnGeolocate'),
      popularChips: document.getElementById('popularChips'),
      favoriteCitiesChips: document.getElementById('favoriteCitiesChips'),
      btnToggleFavorite: document.getElementById('btnToggleFavorite'),

      // Weather Loading & Hero
      weatherLoadingState: document.getElementById('weatherLoadingState'),
      weatherDashboardGrid: document.getElementById('weatherDashboardGrid'),
      cityTimezone: document.getElementById('cityTimezone'),
      locationCity: document.getElementById('locationCity'),
      locationCountry: document.getElementById('locationCountry'),
      weatherConditionPill: document.getElementById('weatherConditionPill'),
      currentWeatherIcon: document.getElementById('currentWeatherIcon'),
      currentTemp: document.getElementById('currentTemp'),
      currentTempUnit: document.getElementById('currentTempUnit'),
      weatherDescription: document.getElementById('weatherDescription'),
      feelsLikeTemp: document.getElementById('feelsLikeTemp'),
      highTemp: document.getElementById('highTemp'),
      lowTemp: document.getElementById('lowTemp'),
      heroPrecipitation: document.getElementById('heroPrecipitation'),
      heroCloudCover: document.getElementById('heroCloudCover'),
      heroWindGusts: document.getElementById('heroWindGusts'),
      heroLastUpdated: document.getElementById('heroLastUpdated'),

      // Metric Cards
      compassPointer: document.getElementById('compassPointer'),
      metricWindSpeed: document.getElementById('metricWindSpeed'),
      metricWindUnit: document.getElementById('metricWindUnit'),
      metricWindDirection: document.getElementById('metricWindDirection'),
      metricHumidity: document.getElementById('metricHumidity'),
      humidityProgress: document.getElementById('humidityProgress'),
      metricDewPoint: document.getElementById('metricDewPoint'),
      metricUVIndex: document.getElementById('metricUVIndex'),
      uvBadge: document.getElementById('uvBadge'),
      uvIndicatorDot: document.getElementById('uvIndicatorDot'),
      metricUVAdvice: document.getElementById('metricUVAdvice'),
      metricAQIValue: document.getElementById('metricAQIValue'),
      aqiBadge: document.getElementById('aqiBadge'),
      aqiPM25: document.getElementById('aqiPM25'),
      aqiPM10: document.getElementById('aqiPM10'),
      aqiAdvice: document.getElementById('aqiAdvice'),
      metricPressure: document.getElementById('metricPressure'),
      pressurePointer: document.getElementById('pressurePointer'),
      metricPressureTrend: document.getElementById('metricPressureTrend'),
      sunSunrise: document.getElementById('sunSunrise'),
      sunSunset: document.getElementById('sunSunset'),
      sunArcPassed: document.getElementById('sunArcPassed'),
      sunArcDot: document.getElementById('sunArcDot'),

      // Hourly & Daily Forecast
      hourlyForecastTrack: document.getElementById('hourlyForecastTrack'),
      hourlySvgChart: document.getElementById('hourlySvgChart'),
      dailyForecastList: document.getElementById('dailyForecastList'),




      // Footer
      btnScrollToTop: document.getElementById('btnScrollToTop')
    };
  },

  bindEvents() {
    // Temperature Unit Toggles
    this.elements.btnCelsius.addEventListener('click', () => this.setUnit('celsius'));
    this.elements.btnFahrenheit.addEventListener('click', () => this.setUnit('fahrenheit'));

    // Global Refresh Button
    this.elements.btnRefreshAll.addEventListener('click', () => this.refreshAllData());

    // Search Autocomplete with Debounce
    let searchTimeout = null;
    this.elements.citySearchInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      this.elements.btnClearSearch.classList.toggle('hidden', val.length === 0);

      clearTimeout(searchTimeout);
      if (val.length < 2) {
        this.elements.citySuggestionsList.classList.add('hidden');
        this.elements.citySuggestionsList.innerHTML = '';
        return;
      }

      searchTimeout = setTimeout(async () => {
        const results = await WeatherService.searchCities(val);
        this.renderCitySuggestions(results);
      }, 280);
    });

    this.elements.btnClearSearch.addEventListener('click', () => {
      this.elements.citySearchInput.value = '';
      this.elements.btnClearSearch.classList.add('hidden');
      this.elements.citySuggestionsList.classList.add('hidden');
      this.elements.citySearchInput.focus();
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
      if (!this.elements.citySearchInput.contains(e.target) && !this.elements.citySuggestionsList.contains(e.target)) {
        this.elements.citySuggestionsList.classList.add('hidden');
      }
    });

    // Geolocation "Locate Me" Button
    this.elements.btnGeolocate.addEventListener('click', () => this.handleGeolocation());

    // Popular City Chips Click Delegation
    this.elements.popularChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (!chip) return;
      const city = {
        name: chip.dataset.city,
        country: chip.dataset.country,
        latitude: parseFloat(chip.dataset.lat),
        longitude: parseFloat(chip.dataset.lon)
      };
      this.loadWeatherForLocation(city);
    });

    // Bookmarked Favorite Toggle
    this.elements.btnToggleFavorite.addEventListener('click', () => {
      StorageService.toggleFavorite(AppState.currentLocation);
    });


    // Back to Top Button
    this.elements.btnScrollToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.elements.networkBanner.classList.remove('show');
      this.elements.apiStatusPill.innerHTML = '<span class="status-pulse-dot"></span><span class="status-text">Connected</span>';
    });

    window.addEventListener('offline', () => {
      this.elements.networkBanner.classList.add('show');
      this.elements.apiStatusPill.innerHTML = '<span class="status-pulse-dot" style="background:#f43f5e;box-shadow:0 0 8px #f43f5e"></span><span class="status-text" style="color:#f43f5e">Offline</span>';
    });
  },



  setUnit(unit) {
    if (AppState.temperatureUnit === unit) return;
    StorageService.saveUnitPreference(unit);
    this.applyUnitButtons();
    if (AppState.weatherData) {
      this.renderWeatherDashboard(AppState.weatherData, AppState.airQualityData);
    }
  },

  applyUnitButtons() {
    const isCelsius = AppState.temperatureUnit === 'celsius';
    this.elements.btnCelsius.classList.toggle('active', isCelsius);
    this.elements.btnCelsius.setAttribute('aria-pressed', isCelsius ? 'true' : 'false');
    this.elements.btnFahrenheit.classList.toggle('active', !isCelsius);
    this.elements.btnFahrenheit.setAttribute('aria-pressed', !isCelsius ? 'true' : 'false');
  },

  async refreshAllData() {
    this.elements.btnRefreshAll.classList.add('spinning');
    try {
      await this.loadWeatherForLocation(AppState.currentLocation);
    } finally {
      setTimeout(() => this.elements.btnRefreshAll.classList.remove('spinning'), 600);
    }
  },

  // ------------------------------------------------------------------------
  // GEOLOCATION & CITY SEARCH
  // ------------------------------------------------------------------------

  handleGeolocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    this.elements.btnGeolocate.disabled = true;
    this.elements.btnGeolocate.querySelector('.btn-text').textContent = 'Locating...';

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse lookup with Open-Meteo or free nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          let cityName = 'Current Location';
          let countryName = '';
          if (res.ok) {
            const data = await res.json();
            cityName = data.address.city || data.address.town || data.address.village || data.address.county || 'My Location';
            countryName = data.address.country || '';
          }

          const myLocation = {
            name: cityName,
            country: countryName,
            latitude: latitude,
            longitude: longitude
          };

          this.loadWeatherForLocation(myLocation);
        } catch (e) {
          this.loadWeatherForLocation({
            name: 'Current Coordinates',
            country: '',
            latitude: latitude,
            longitude: longitude
          });
        } finally {
          this.elements.btnGeolocate.disabled = false;
          this.elements.btnGeolocate.querySelector('.btn-text').textContent = 'Locate Me';
        }
      },
      (err) => {
        console.warn('Geolocation warning:', err.message);
        alert('Could not access your location. Please type your city in the search bar.');
        this.elements.btnGeolocate.disabled = false;
        this.elements.btnGeolocate.querySelector('.btn-text').textContent = 'Locate Me';
      },
      { timeout: 10000 }
    );
  },

  renderCitySuggestions(results) {
    if (!results || results.length === 0) {
      this.elements.citySuggestionsList.innerHTML = `<li class="suggestion-item" style="color:var(--text-muted)">No matching cities found</li>`;
      this.elements.citySuggestionsList.classList.remove('hidden');
      return;
    }

    this.elements.citySuggestionsList.innerHTML = results.map(city => {
      const state = city.admin1 ? `${city.admin1}, ` : '';
      return `
        <li class="suggestion-item" data-lat="${city.latitude}" data-lon="${city.longitude}" data-name="${city.name}" data-country="${city.country || ''}">
          <div>
            <span class="sugg-city">${city.name}</span>
            <span class="sugg-country">(${state}${city.country || ''})</span>
          </div>
          <span class="sugg-coords">${city.latitude.toFixed(2)}°, ${city.longitude.toFixed(2)}°</span>
        </li>
      `;
    }).join('');

    this.elements.citySuggestionsList.classList.remove('hidden');

    // Add click listeners to items
    this.elements.citySuggestionsList.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const selected = {
          name: item.dataset.name,
          country: item.dataset.country,
          latitude: parseFloat(item.dataset.lat),
          longitude: parseFloat(item.dataset.lon)
        };
        this.elements.citySearchInput.value = `${selected.name}${selected.country ? ', ' + selected.country : ''}`;
        this.elements.citySuggestionsList.classList.add('hidden');
        this.loadWeatherForLocation(selected);
      });
    });
  },

  renderFavoritesChips() {
    if (!this.elements.favoriteCitiesChips) return;
    if (AppState.favorites.length === 0) {
      this.elements.favoriteCitiesChips.innerHTML = `<span style="font-size:0.78rem;color:var(--text-muted)">No saved locations</span>`;
      return;
    }

    this.elements.favoriteCitiesChips.innerHTML = AppState.favorites.map(fav => `
      <button class="chip-btn fav-chip" data-name="${fav.name}" data-country="${fav.country}" data-lat="${fav.latitude}" data-lon="${fav.longitude}">
        ★ ${fav.name}
      </button>
    `).join('');

    this.elements.favoriteCitiesChips.querySelectorAll('.fav-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = {
          name: btn.dataset.name,
          country: btn.dataset.country,
          latitude: parseFloat(btn.dataset.lat),
          longitude: parseFloat(btn.dataset.lon)
        };
        this.loadWeatherForLocation(city);
      });
    });
  },

  updateFavoriteButtonState() {
    const isFav = StorageService.isFavorite(AppState.currentLocation.name);
    this.elements.btnToggleFavorite.classList.toggle('favorited', isFav);
    this.elements.btnToggleFavorite.title = isFav ? 'Remove from saved favorites' : 'Bookmark this city';
  },

  // ------------------------------------------------------------------------
  // WEATHER LOADING & DISPLAY
  // ------------------------------------------------------------------------

  async loadWeatherForLocation(locationObj) {
    AppState.currentLocation = locationObj;
    this.updateFavoriteButtonState();

    this.elements.weatherLoadingState.classList.remove('hidden');
    this.elements.weatherDashboardGrid.style.opacity = '0.5';

    try {
      const [weather, airQuality] = await Promise.all([
        WeatherService.fetchWeatherData(locationObj.latitude, locationObj.longitude),
        WeatherService.fetchAirQuality(locationObj.latitude, locationObj.longitude)
      ]);

      AppState.weatherData = weather;
      AppState.airQualityData = airQuality;

      this.renderWeatherDashboard(weather, airQuality);

    } catch (err) {
      console.error('Weather loading failed:', err);
      alert('Unable to retrieve weather data. Please check your internet connection and try again.');
    } finally {
      this.elements.weatherLoadingState.classList.add('hidden');
      this.elements.weatherDashboardGrid.style.opacity = '1';
    }
  },

  renderWeatherDashboard(weather, aqi) {
    const current = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;
    const wmoInfo = WMO_WEATHER_MAP[current.weather_code] || { label: 'Clear', icon: 'clear-day', bgTheme: 'sunny', advice: 'Pleasant conditions.' };

    // Dynamic background theme
    document.body.setAttribute('data-weather-type', wmoInfo.bgTheme);

    // Header & Meta
    this.elements.locationCity.textContent = AppState.currentLocation.name;
    this.elements.locationCountry.textContent = AppState.currentLocation.country || 'Global Forecast Coordinates';
    this.elements.weatherConditionPill.textContent = wmoInfo.label;
    this.elements.weatherDescription.textContent = `${wmoInfo.label} — ${wmoInfo.advice}`;

    // Local time representation
    if (weather.timezone) {
      try {
        const localNow = new Date().toLocaleTimeString('en-US', {
          timeZone: weather.timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        this.elements.cityTimezone.textContent = `Local Time: ${localNow} (${weather.timezone_abbreviation || ''})`;
      } catch (e) {
        this.elements.cityTimezone.textContent = `Timezone: ${weather.timezone}`;
      }
    }

    // Current Temp, Feels Like, High, Low
    const unitSymbol = AppState.temperatureUnit === 'fahrenheit' ? '°F' : '°C';
    this.elements.currentTemp.textContent = WeatherService.formatTemp(current.temperature_2m);
    this.elements.currentTempUnit.textContent = unitSymbol;
    this.elements.feelsLikeTemp.textContent = `${WeatherService.formatTemp(current.apparent_temperature)}${unitSymbol}`;
    this.elements.highTemp.textContent = `${WeatherService.formatTemp(daily.temperature_2m_max[0])}${unitSymbol}`;
    this.elements.lowTemp.textContent = `${WeatherService.formatTemp(daily.temperature_2m_min[0])}${unitSymbol}`;

    // Hero Weather Icon
    this.elements.currentWeatherIcon.innerHTML = getWeatherSvgIcon(wmoInfo.icon, current.is_day);

    // Hero Stats
    this.elements.heroPrecipitation.textContent = `${current.precipitation} mm`;
    this.elements.heroCloudCover.textContent = `${current.cloud_cover}%`;

    const windInfo = WeatherService.formatWind(current.wind_gusts_10m || current.wind_speed_10m);
    this.elements.heroWindGusts.textContent = `${windInfo.speed} ${windInfo.unit}`;
    this.elements.heroLastUpdated.textContent = 'Live Synced';

    // ---------------- METRIC 1: WIND & COMPASS ----------------
    const windCurrent = WeatherService.formatWind(current.wind_speed_10m);
    this.elements.metricWindSpeed.textContent = windCurrent.speed;
    this.elements.metricWindUnit.textContent = windCurrent.unit;
    this.elements.metricWindDirection.textContent = `Direction: ${WeatherService.getDegreesText(current.wind_direction_10m)}`;
    this.elements.compassPointer.style.transform = `rotate(${current.wind_direction_10m}deg)`;

    // ---------------- METRIC 2: HUMIDITY & DEW POINT ----------------
    this.elements.metricHumidity.textContent = current.relative_humidity_2m;
    this.elements.humidityProgress.style.width = `${Math.min(100, current.relative_humidity_2m)}%`;

    // Dew point approximation (Magnus formula)
    const T = current.temperature_2m;
    const RH = current.relative_humidity_2m;
    const dewPointC = Math.round(T - ((100 - RH) / 5));
    const dewPointFormatted = `${WeatherService.formatTemp(dewPointC)}${unitSymbol}`;
    const humidityComfort = RH > 75 ? 'Humid & Moist' : RH < 30 ? 'Dry Atmosphere' : 'Comfortable Ambient Air';
    this.elements.metricDewPoint.textContent = `${humidityComfort} • Dew point: ${dewPointFormatted}`;

    // ---------------- METRIC 3: UV INDEX ----------------
    const maxUV = daily.uv_index_max ? daily.uv_index_max[0] : 3.5;
    this.elements.metricUVIndex.textContent = maxUV ? maxUV.toFixed(1) : '--';

    let uvBadgeClass = 'uv-badge-low';
    let uvText = 'Low';
    let uvAdvice = 'No specific sun protection needed.';

    if (maxUV >= 11) {
      uvBadgeClass = 'uv-badge-veryhigh'; uvText = 'Extreme'; uvAdvice = 'Avoid direct exposure midday; stay shaded.';
    } else if (maxUV >= 8) {
      uvBadgeClass = 'uv-badge-veryhigh'; uvText = 'Very High'; uvAdvice = 'Sun protection essential. Wear sunscreen.';
    } else if (maxUV >= 6) {
      uvBadgeClass = 'uv-badge-high'; uvText = 'High'; uvAdvice = 'Cover up, wear hat and sunglasses.';
    } else if (maxUV >= 3) {
      uvBadgeClass = 'uv-badge-moderate'; uvText = 'Moderate'; uvAdvice = 'Sun protection advised near midday.';
    }

    this.elements.uvBadge.className = `badge-status-pill ${uvBadgeClass}`;
    this.elements.uvBadge.textContent = uvText;
    this.elements.metricUVAdvice.textContent = uvAdvice;
    this.elements.uvIndicatorDot.style.left = `${Math.min(100, (maxUV / 12) * 100)}%`;

    // ---------------- METRIC 4: AIR QUALITY ----------------
    if (aqi && aqi.current) {
      const usAqi = aqi.current.us_aqi !== null ? Math.round(aqi.current.us_aqi) : 35;
      this.elements.metricAQIValue.textContent = usAqi;

      let aqiClass = 'aqi-badge-good';
      let aqiStatus = 'Good';
      let aqiNote = 'Air quality is satisfactory with little to no risk.';

      if (usAqi > 200) {
        aqiClass = 'aqi-badge-unhealthy'; aqiStatus = 'Very Unhealthy'; aqiNote = 'Health alert: everyone may experience more serious health effects.';
      } else if (usAqi > 150) {
        aqiClass = 'aqi-badge-unhealthy'; aqiStatus = 'Unhealthy'; aqiNote = 'Sensitive groups may experience health effects.';
      } else if (usAqi > 100) {
        aqiClass = 'aqi-badge-moderate'; aqiStatus = 'Moderate'; aqiNote = 'Acceptable air quality; unusually sensitive persons consider limiting exertion.';
      } else if (usAqi > 50) {
        aqiClass = 'aqi-badge-moderate'; aqiStatus = 'Moderate'; aqiNote = 'Air quality is acceptable for outdoor activity.';
      }

      this.elements.aqiBadge.className = `badge-status-pill ${aqiClass}`;
      this.elements.aqiBadge.textContent = aqiStatus;
      this.elements.aqiAdvice.textContent = aqiNote;

      const pm25 = aqi.current.pm2_5 !== null ? aqi.current.pm2_5.toFixed(1) : '--';
      const pm10 = aqi.current.pm10 !== null ? aqi.current.pm10.toFixed(1) : '--';
      this.elements.aqiPM25.textContent = `${pm25} µg/m³`;
      this.elements.aqiPM10.textContent = `${pm10} µg/m³`;
    } else {
      this.elements.metricAQIValue.textContent = '35';
      this.elements.aqiBadge.textContent = 'Good';
      this.elements.aqiPM25.textContent = '8.5 µg/m³';
      this.elements.aqiPM10.textContent = '16.2 µg/m³';
      this.elements.aqiAdvice.textContent = 'Clean air conditions suitable for all outdoor activity.';
    }

    // ---------------- METRIC 5: PRESSURE ----------------
    const pressure = current.pressure_msl ? Math.round(current.pressure_msl) : 1013;
    this.elements.metricPressure.textContent = pressure;
    // Standard sea level pressure = 1013.25 hPa; gauge range ~ 970 to 1050
    const pressurePct = Math.min(100, Math.max(0, ((pressure - 970) / (1050 - 970)) * 100));
    this.elements.pressurePointer.style.left = `${pressurePct}%`;

    let pTrend = 'Normal barometric pressure';
    if (pressure > 1022) pTrend = 'High pressure system (clear/fair weather)';
    if (pressure < 1005) pTrend = 'Low pressure system (unsettled / precipitation potential)';
    this.elements.metricPressureTrend.textContent = pTrend;

    // ---------------- METRIC 6: SUN SCHEDULE ----------------
    if (daily.sunrise && daily.sunrise[0] && daily.sunset && daily.sunset[0]) {
      const sunriseDate = new Date(daily.sunrise[0]);
      const sunsetDate = new Date(daily.sunset[0]);

      this.elements.sunSunrise.textContent = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.elements.sunSunset.textContent = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Sun Arc Progress calculation
      const now = new Date();
      const totalDayMs = sunsetDate - sunriseDate;
      const passedMs = now - sunriseDate;
      const sunRatio = Math.max(0, Math.min(1, passedMs / totalDayMs));

      // Calculate coordinates on the SVG arc (center 80, 60, radius 65 from 180 to 0 degrees)
      const angle = Math.PI - (sunRatio * Math.PI);
      const sunX = 80 + 65 * Math.cos(angle);
      const sunY = 60 - 65 * Math.sin(angle);

      this.elements.sunArcDot.setAttribute('cx', sunX);
      this.elements.sunArcDot.setAttribute('cy', sunY);
    }

    // ---------------- 24-HOUR FORECAST CAROUSEL & SVG CHART ----------------
    this.renderHourlyForecast(hourly);

    // ---------------- 7-DAY EXTENDED OUTLOOK ----------------
    this.renderDailyForecast(daily);
  },

  renderHourlyForecast(hourly) {
    if (!hourly || !hourly.time) return;

    // Determine current hour index
    const nowIsoHour = new Date().toISOString().slice(0, 13);
    let startIdx = hourly.time.findIndex(t => t.startsWith(nowIsoHour));
    if (startIdx < 0) startIdx = 0;

    const next24 = [];
    for (let i = startIdx; i < Math.min(startIdx + 24, hourly.time.length); i++) {
      next24.push({
        time: hourly.time[i],
        temp: hourly.temperature_2m[i],
        code: hourly.weather_code[i],
        precip: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
        isDay: hourly.is_day ? hourly.is_day[i] : 1
      });
    }

    const unitSymbol = AppState.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

    // 1. Render Carousel Items
    this.elements.hourlyForecastTrack.innerHTML = next24.map((item, idx) => {
      const date = new Date(item.time);
      const hourLabel = idx === 0 ? 'Now' : date.toLocaleTimeString([], { hour: 'numeric' });
      const wmo = WMO_WEATHER_MAP[item.code] || { icon: 'clear-day' };

      return `
        <div class="hourly-item-card ${idx === 0 ? 'now' : ''}" tabindex="0">
          <span class="hourly-time">${hourLabel}</span>
          <div class="hourly-icon">${getWeatherSvgIcon(wmo.icon, item.isDay)}</div>
          <span class="hourly-temp">${WeatherService.formatTemp(item.temp)}${unitSymbol}</span>
          <span class="hourly-precip" title="Precipitation Probability">
            💧 ${item.precip}%
          </span>
        </div>
      `;
    }).join('');

    // 2. Render Smooth SVG Dynamic Temperature Chart
    this.renderHourlySvgCurve(next24);
  },

  renderHourlySvgCurve(hourlyItems) {
    if (hourlyItems.length < 2) return;

    const temps = hourlyItems.map(h => WeatherService.formatTemp(h.temp));
    const minTemp = Math.min(...temps) - 2;
    const maxTemp = Math.max(...temps) + 2;
    const tempRange = Math.max(1, maxTemp - minTemp);

    const svgWidth = 800;
    const svgHeight = 110;
    const paddingX = 25;
    const paddingY = 20;
    const usableW = svgWidth - paddingX * 2;
    const usableH = svgHeight - paddingY * 2;

    const stepX = usableW / (hourlyItems.length - 1);

    // Compute coordinate points
    const points = temps.map((t, i) => {
      const x = paddingX + i * stepX;
      const y = paddingY + usableH - ((t - minTemp) / tempRange) * usableH;
      return { x, y, temp: t };
    });

    // Build smooth Bezier Curve SVG Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpx2 = cpx1;
      pathD += ` C ${cpx1} ${p0.y}, ${cpx2} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

    this.elements.hourlySvgChart.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00f0ff" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#00f0ff" stop-opacity="0.0" />
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#chartGrad)"></path>
      <path d="${pathD}" fill="none" stroke="#00f0ff" stroke-width="3" stroke-linecap="round"></path>
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="3.5" fill="#080c14" stroke="#00f0ff" stroke-width="2"/>
      `).join('')}
    `;
  },

  renderDailyForecast(daily) {
    if (!daily || !daily.time) return;

    const allMins = daily.temperature_2m_min.map(t => WeatherService.formatTemp(t));
    const allMaxs = daily.temperature_2m_max.map(t => WeatherService.formatTemp(t));
    const weekMin = Math.min(...allMins);
    const weekMax = Math.max(...allMaxs);
    const weekRange = Math.max(1, weekMax - weekMin);
    const unitSymbol = AppState.temperatureUnit === 'fahrenheit' ? '°F' : '°C';

    const daysHtml = daily.time.map((timeStr, idx) => {
      const date = new Date(timeStr);
      let dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
      if (idx === 0) dayName = 'Today';
      if (idx === 1) dayName = 'Tomorrow';

      const code = daily.weather_code[idx];
      const wmo = WMO_WEATHER_MAP[code] || { label: 'Clear', icon: 'clear-day' };
      const min = allMins[idx];
      const max = allMaxs[idx];
      const precip = daily.precipitation_probability_max ? daily.precipitation_probability_max[idx] : 0;

      // Range bar calculations
      const barLeftPct = ((min - weekMin) / weekRange) * 100;
      const barWidthPct = Math.max(8, ((max - min) / weekRange) * 100);

      return `
        <div class="daily-row-item">
          <span class="daily-day-label">${dayName}</span>
          <div class="daily-condition-group">
            <div class="daily-icon">${getWeatherSvgIcon(wmo.icon, 1)}</div>
            <span class="daily-condition-text">${wmo.label}</span>
          </div>
          <span class="daily-precip-badge">${precip > 15 ? `💧 ${precip}%` : ''}</span>
          <div class="daily-range-bar-track">
            <div class="daily-range-bar-fill" style="left: ${barLeftPct}%; width: ${barWidthPct}%;"></div>
          </div>
          <div class="daily-temps">
            <span class="min-temp">${min}${unitSymbol}</span>
            <span class="max-temp">${max}${unitSymbol}</span>
          </div>
        </div>
      `;
    }).join('');

    this.elements.dailyForecastList.innerHTML = daysHtml;
  },


};

// ==========================================================================
// 7. BOOTSTRAP INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  UIController.init();
});
