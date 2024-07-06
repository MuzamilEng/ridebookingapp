import React, { useEffect, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";
import MapView, { Marker, Circle, Polyline } from "react-native-maps";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useGetAllUsersMutation } from "../redux/storeApi";
import polyline from "@mapbox/polyline";

export default function Map() {
  const [userData, setUserData] = useState({});
  const [getUserByType, { isError, isLoading, data }] =
    useGetAllUsersMutation();
  const [region, setRegion] = useState({
    latitude: 31.5204, // Latitude of Lahore
    longitude: 74.3587, // Longitude of Lahore
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [nearbyMarkers, setNearbyMarkers] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [distance, setDistance] = useState(null);

  const customMarkers = [
    { id: 1, latitude: 31.5497, longitude: 74.3436, title: "Badshahi Mosque" },
    { id: 2, latitude: 31.5841, longitude: 74.3587, title: "Lahore Fort" },
    { id: 3, latitude: 31.558, longitude: 74.3286, title: "Minar-e-Pakistan" },
    // Add more markers as needed
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData1 = await AsyncStorage.getItem("userData");
        if (userData1) {
          const parsedData = JSON.parse(userData1);
          setUserData(parsedData);
          console.log(parsedData.data.data.userType, "myDataAsync");
          await getUserByType({
            userType: parsedData?.data?.data?.userType,
          });
        } else {
          console.log("no data");
        }
      } catch (error) {
        console.error("Error retrieving data: ", error.message);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("Location permission denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error fetching location: ", error.message);
      }
    };

    fetchCurrentLocation();
  }, []);

  useEffect(() => {
    const watchLocation = async () => {
      try {
        const location = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10 }, // Update every 10 meters
          (location) => {
            const { latitude, longitude } = location.coords;
            setCurrentLocation({ latitude, longitude });
            if (selectedMarker) {
              fetchRoute({ latitude, longitude }, selectedMarker);
            }
          }
        );
        return () => location.remove(); // Clean up watcher
      } catch (error) {
        console.error("Error watching location: ", error.message);
      }
    };

    watchLocation();
  }, [selectedMarker]);

  const fetchRoute = async (origin, destination) => {
    const originString = `${origin.latitude},${origin.longitude}`;
    const destinationString = `${destination.latitude},${destination.longitude}`;
    const apiKey = "AIzaSyA7cZCuVvMKML7cS7L-5uzyk5OrSEyqXW8"; // Replace with your API key

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originString}&destination=${destinationString}&key=${apiKey}`
      );
      const data = await response.json();
      if (data.routes.length) {
        const points = polyline.decode(data.routes[0].overview_polyline.points);
        const routeCoords = points.map((point) => ({
          latitude: point[0],
          longitude: point[1],
        }));
        setRouteCoordinates(routeCoords);
        calculateDistance(origin, destination);
      }
    } catch (error) {
      console.error("Error fetching route: ", error.message);
    }
  };

  const calculateDistance = (origin, destination) => {
    const distanceInKm = getDistanceFromLatLonInKm(
      origin.latitude,
      origin.longitude,
      destination.latitude,
      destination.longitude
    );
    setDistance(distanceInKm.toFixed(2)); // Round to 2 decimal places
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => deg * (Math.PI / 180);
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const onMarkerPress = (marker) => {
    setSelectedMarker(marker);
    fetchRoute(currentLocation, marker);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GooglePlacesAutocomplete
        placeholder="Search"
        fetchDetails={true}
        onPress={(data, details = null) => onPlaceSelected(details)}
        query={{
          key: "AIzaSyA7cZCuVvMKML7cS7L-5uzyk5OrSEyqXW8", // Replace with your API key
          language: "en",
        }}
        styles={{
          container: {
            position: "absolute",
            top: 10,
            width: "90%",
            zIndex: 1,
          },
          listView: {
            backgroundColor: "white",
          },
        }}
      />

      <MapView
        style={styles.map}
        initialRegion={region}
        zoomEnabled={true}
        provider="google"
        region={region}
      >
        {currentLocation && (
          <Circle
            center={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            radius={10000} // Radius in meters
            fillColor="rgba(0, 0, 255, 0.1)"
            strokeColor="rgba(0, 0, 255, 0.3)"
          />
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title="Destination"
            pinColor="green"
          />
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="red"
            strokeWidth={2}
          />
        )}

        {data?.data?.map((item, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(item?.lat),
              longitude: parseFloat(item?.long),
            }}
            title={item?.name || `User ${index + 1}`}
            pinColor={item?._id === userData?.data?.data?._id ? "blue" : "red"} // Blue for the login user, red for others
            onPress={() => onMarkerPress(item)}
          />
        ))}

        {customMarkers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={marker.title}
            onPress={() => onMarkerPress(marker)}
          />
        ))}
      </MapView>

      {selectedMarker && (
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceText}>Distance: {distance} km</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  distanceContainer: {
    position: "absolute",
    bottom: 10,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    elevation: 3,
  },
  distanceText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
