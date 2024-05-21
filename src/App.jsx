import React, { useState, useEffect } from 'react';

const WeatherPanel = ({ locations }) => {
    const [weatherData, setWeatherData] = useState({});

    useEffect(() => {
        const getData = async (location) => {
            try {
                const response = await fetch("https://data.bmkg.go.id/DataMKG/MEWS/DigitalForecast/DigitalForecast-DIYogyakarta.xml");
                const text = await response.text();
                const data = new window.DOMParser().parseFromString(text, "text/xml");

                let timeArray = [];
                let temArray = [];
                let humArray = [];
                let winddirArray = [];
                let windspeedArray = [];
                let weatherArray = [];

                const pathTem = `data/forecast/area[@description="${location}"]/parameter[@id="t"]/timerange/value[@unit="C"]`;
                const pathHum = `data/forecast/area[@description="${location}"]/parameter[@id="hu"]/timerange/value`;
                const pathWeather = `data/forecast/area[@description="${location}"]/parameter[@id="weather"]/timerange/value`;
                const pathTime = `data/forecast/area[@description="${location}"]/parameter[@id="hu"]/timerange`;
                const pathWD = `data/forecast/area[@description="${location}"]/parameter[@id="wd"]/timerange/value[@unit="deg"]`;
                const pathWS = `data/forecast/area[@description="${location}"]/parameter[@id="ws"]/timerange/value[@unit="MS"]`;

                if (data.evaluate) {
                    let i = 0;
                    let nodeT = data.evaluate(pathTem, data, null, XPathResult.ANY_TYPE, null);
                    let nodeH = data.evaluate(pathHum, data, null, XPathResult.ANY_TYPE, null);
                    let nodeWD = data.evaluate(pathWD, data, null, XPathResult.ANY_TYPE, null);
                    let nodeWS = data.evaluate(pathWS, data, null, XPathResult.ANY_TYPE, null);
                    let nodeW = data.evaluate(pathWeather, data, null, XPathResult.ANY_TYPE, null);
                    let nodeTime = data.evaluate(pathTime, data, null, XPathResult.ANY_TYPE, null);

                    let resultT = nodeT.iterateNext();
                    let resultH = nodeH.iterateNext();
                    let resultWD = nodeWD.iterateNext();
                    let resultWS = nodeWS.iterateNext();
                    let resultW = nodeW.iterateNext();
                    let resultTime = nodeTime.iterateNext();

                    while (resultT && resultH && resultWD && resultWS && resultW && resultTime) {
                        timeArray[i] = resultTime.getAttributeNode("datetime").nodeValue;
                        temArray[i] = resultT.childNodes[0].nodeValue;
                        humArray[i] = resultH.childNodes[0].nodeValue;
                        winddirArray[i] = resultWD.childNodes[0].nodeValue;
                        windspeedArray[i] = Math.floor(resultWS.childNodes[0].nodeValue);
                        weatherArray[i] = resultW.childNodes[0].nodeValue;

                        resultT = nodeT.iterateNext();
                        resultH = nodeH.iterateNext();
                        resultWD = nodeWD.iterateNext();
                        resultWS = nodeWS.iterateNext();
                        resultW = nodeW.iterateNext();
                        resultTime = nodeTime.iterateNext();
                        i++;
                    }
                }

                console.log(`Data for ${location}:`, { timeArray, temArray, humArray, winddirArray, windspeedArray, weatherArray });

                setWeatherData(prevState => ({
                    ...prevState,
                    [location]: { timeArray, temArray, humArray, winddirArray, windspeedArray, weatherArray }
                }));
            } catch (error) {
                console.error(`Failed to fetch data for ${location}:`, error);
            }
        };

        locations.forEach(location => {
            getData(location);
        });
    }, [locations]);

    const renderWeatherData = (data) => {
      const { timeArray, temArray, humArray, winddirArray, windspeedArray, weatherArray } = data;

      return timeArray.map((time, index) => {
          const date = new Date(time);
          const hours = date.getHours();
          const day = date.getDate();
          const month = date.toLocaleString('default', { month: 'long' });
          const year = date.getFullYear();

          return (
              <div className="box" key={time}>
                  <h3>{hours}.00</h3>
                  <img src={`../src/assets/w_${parseInt(weatherArray[index])}.png`} width="85px" alt="weather icon"/><br />
                  <i className="fas fa-temperature-high"></i> {temArray[index]}<sup>o</sup>C<br />
                  <i className="fas fa-tint"></i> {humArray[index]}%<br />
                  <i className="fas fa-location-arrow"></i> {winddirArray[index]}<sup>o</sup><br />
                  <i className="fas fa-wind"></i> {windspeedArray[index]} m/s<br />
              </div>
          );
      });
  };

    return (
        <div id="main">
          <div className='title'>
          <h1>Weather Forecast</h1>
          <p style={{textAlign: 'center'}}>API by BMKG</p>
          </div>

            {locations.map(location => (
                <div key={location}>
                    <div className="container"><div className="box"><h1>{location}</h1></div></div>
                    <div className="container" id={`days${location}`}>
                        {/* Render days data here */}
                    </div>
                    <div className="container" id={`dataHours${location}`}>
                      {weatherData[location] && renderWeatherData(weatherData[location])}
                        {/* Render data hours here */}
                    </div>
                </div>
            ))}
        </div>
    );
};

const App = () => {
    return (
        <div>
            <WeatherPanel locations={['Bantul', 'Sleman', 'Yogyakarta']} />
        </div>
    );
};

export default App;
