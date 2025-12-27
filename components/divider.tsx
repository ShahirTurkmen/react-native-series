import React from "react";
import { View } from "react-native";

const CustomDivider = ({ color = "gray", height = 1, style = {} }) => {
  return (
    <View
      style={[
        { borderColor: color, height: height, borderTopWidth: 0.5 },
        style,
      ]}
    />
  );
};

export default CustomDivider;
