import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Create the context
const GlobalContext = createContext(null);

// Define props type for GlobalContextProvider
const GlobalContextProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [login, setLogin] = useState(false);
  const [location, setLocation] = useState({});

  // Function to save token in local storage
  const tokenInlocal = async (data) => {
    try {
      if (data) {
        console.log(data, "datallll");
        await AsyncStorage.setItem("userData", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error setting user data in AsyncStorage", error);
    }
  };

  // Function to log in the user
  const loginUser = async (data) => {
    try {
      await tokenInlocal(data);
      setLogin(true);
      setData(data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  // Function to log out the user
  const logoutUser = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      setLogin(false);
      setData(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Check if the user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setLogin(true);
          // setData(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error checking login status", error);
      }
    };

    checkLoginStatus();
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        data,
        setData,
        login,
        setLogin,
        loginUser,
        logoutUser,
        tokenInlocal,
        location,
        setLocation,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to consume the context
const useGlobalState = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error(
      "useGlobalState must be used within a GlobalContextProvider"
    );
  }

  return context;
};

export { GlobalContextProvider, useGlobalState };
