import React, { useEffect, useState } from "react";
import * as Location from "expo-location";

const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to proceed."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location.coords);
      console.log(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error("Error getting current location:", error);
    }
  };
  useEffect(() => {
    getCurrentLocation();
  }, []);
  return { currentLocation };
};

export default useLocation;
