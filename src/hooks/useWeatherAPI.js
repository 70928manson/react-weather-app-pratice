import { useState, useEffect, useCallback } from 'react';  //最後不會回傳 JSX，因此不需要匯入 react 套件提供的 React 物件

const fetchCurrentWeather = (locationName) => {
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=${process.env.REACT_APP_AUTHORIZATION_KEY}&locationName=${locationName}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
  
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['WDSD', 'TEMP'].includes(item.elementName)) {
              neededElements[item.elementName] = item.elementValue;
            }
            return neededElements;
          },
          {}
        );
  
        return {
          observationTime: locationData.time.obsTime,
          locationName: locationData.locationName,
          temperature: weatherElements.TEMP,
          windSpeed: weatherElements.WDSD,
        };
      });
};
  
const fetchWeatherForecast = (cityName) => {
    return fetch(
      `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${process.env.REACT_APP_AUTHORIZATION_KEY}&locationName=${cityName}`
    )
      .then((response) => response.json())
      .then((data) => {
        const locationData = data.records.location[0];
        const weatherElements = locationData.weatherElement.reduce(
          (neededElements, item) => {
            if (['Wx', 'PoP', 'CI'].includes(item.elementName)) {
              neededElements[item.elementName] = item.time[0].parameter;
            }
            return neededElements;
          },
          {}
        );
  
        return {
          description: weatherElements.Wx.parameterName,
          weatherCode: weatherElements.Wx.parameterValue,
          rainPossibility: weatherElements.PoP.parameterName,
          comfortability: weatherElements.CI.parameterName,
        };
      });
};

const useWeatherAPI = ({ locationName, cityName }) => {
    const [weatherElement, setWeatherElement] = useState({
        observationTime: new Date(),
        locationName: '',
        temperature: 0,
        windSpeed: 0,
        description: '',
        weatherCode: 0,
        rainPossibility: 0,
        comfortability: '',
        isLoading: true,
    });

    // 在 useEffect 中定義 async function 取名為 fetchData
    const fetchData = useCallback(async () => {
      setWeatherElement((prevState) => ({
        ...prevState,
        isLoading: true,
      }))
      // 使用 Promise.all 搭配 await 等待兩個 API 都取得回應後才繼續
      const [currentWeather, weatherForecast] = await Promise.all([
        fetchCurrentWeather(locationName),
        fetchWeatherForecast(cityName),
      ]);

      // 檢視取得的資料
      console.log(currentWeather,  weatherForecast);

      setWeatherElement({
        ...currentWeather,
        ...weatherForecast,
        isLoading: false,
      })
    }, [locationName, cityName]);
    
    //第一次載入網頁時更新資料
    useEffect(() => {
      // 再 useEffect 中呼叫 fetchData 方法
      fetchData();
    }, [fetchData]);

    //回傳要讓其他元件使用的資料或方法
    return [weatherElement, fetchData];
}

export default useWeatherAPI;