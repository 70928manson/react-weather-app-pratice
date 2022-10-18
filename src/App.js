import React, { useState, useEffect, useMemo } from 'react';

import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';

import { findLocation, getMoment } from './utils/helper';

import WeatherCard from './views/WeatherCard';
import WeatherSetting from './views/WeatherSetting';

import useWeatherAPI from './hooks/useWeatherAPI';

const theme = {
  light: {
    backgroundColor: '#ededed',
    foregroundColor: '#f9f9f9',
    boxShadow: '0 1px 3px 0 #999999',
    titleColor: '#212121',
    temperatureColor: '#757575',
    textColor: '#828282',
  },
  dark: {
    backgroundColor: '#1F2022',
    foregroundColor: '#121416',
    boxShadow:
      '0 1px 4px 0 rgba(12, 12, 13, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.15)',
    titleColor: '#f9f9fa',
    temperatureColor: '#dddddd',
    textColor: '#cccccc',
  },
};

const Container = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const App = () => {
  const [currentTheme, setCurrentTheme] = useState('light');

  // 從 localStorage 取出先前保存的地區，若沒有保存過則給予預設值臺北市
  const storageCity = localStorage.getItem('cityName') || '臺北市';

  const [currentCity, setCurrentCity] = useState(storageCity);
  const currentLocation = useMemo(() => findLocation(currentCity), [
    currentCity,
  ]);
  const { cityName, locationName, sunriseCityName } = currentLocation;

  //moment 白天或晚上
  const moment = useMemo(() => 
    getMoment(sunriseCityName), [sunriseCityName]
  );

  useEffect(() => {
    setCurrentTheme(moment === 'day' ? 'light' : 'dark');
  }, [moment])  // dependencies 只有當 moment 有改變時，才會再次執行樣式主題的更換

  const [weatherElement, fetchData] = useWeatherAPI({
    locationName,
    cityName,
  });

  const [currentPage, setCurrentPage] = useState('WeatherCard');
  const handleCurrentPageChange = (currentPage) => {
    setCurrentPage(currentPage);
  }

  const handleCurrentCityChange = (currentCity) => {
    setCurrentCity(currentCity);
  }


  return (
    <ThemeProvider theme={theme[currentTheme]}>
      <Container>
        {/*  利用條件轉譯的方式決定要呈現哪個元件  */}
        {currentPage === 'WeatherCard' && (
          <WeatherCard 
            cityName={cityName}
            weatherElement={weatherElement}
            moment={moment}
            fetchData={fetchData}
            handleCurrentPageChange={handleCurrentPageChange}
          />
        )}

        {currentPage === 'WeatherSetting' && (
          <WeatherSetting
            cityName={cityName} 
            handleCurrentCityChange={handleCurrentCityChange}
            handleCurrentPageChange={handleCurrentPageChange} />
        )}
      </Container>
    </ThemeProvider>
  );
};
export default App;