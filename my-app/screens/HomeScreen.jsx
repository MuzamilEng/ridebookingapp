import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { Button, Image, StyleSheet, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={{
            uri: "https://www.rentallscript.com/resources/content/images/2021/10/Online-Car-Reservation-System.png",
          }}
          style={styles.image}
        />
      </View>
      <View style={{}}>
        <Button
          title="Go to payment"
          onPress={() => navigation.navigate("payment")}
        />
        <Button
          title="Go to login"
          onPress={() => navigation.navigate("login")}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    gap: 40,
  },
  image: {
    width: "100%",
    height: 450,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    overflow: "hidden",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    // Shadow for Android
    elevation: 5,
  },
});
export default HomeScreen;
