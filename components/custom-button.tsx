import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

const CustomButton = ({
  onPress,
  title = "Placeholder",
}: {
  onPress: () => void;
  title: string;
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        // Style can be a function that receives 'pressed' state
        styles.buttonContainer,
        pressed && styles.buttonPressed,
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    width: 300,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center", // Center text horizontally
    justifyContent: "center", // Center text vertically
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonPressed: {
    backgroundColor: "#0056b3", // Darker color when pressed
  },
});

export default CustomButton;
