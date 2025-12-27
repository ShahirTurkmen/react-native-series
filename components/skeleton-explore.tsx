import { Skeleton } from "moti/skeleton";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function SkeletonComponent() {
  return (
    <View
      style={{
        flex: 1,
        paddingTop: 45,
        paddingLeft: 20,
      }}
    >
      <View
        style={[
          {
            marginTop: 20,
            // width: "50%",
            height: 309,
            overflow: "hidden",
            // shadow for ios
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
            // elevation for android
            elevation: 2,
          },
          styles.card,
        ]}
      >
        <Skeleton height={140} width={"90%"} />
        <View style={{ padding: 15 }}>
          <Skeleton width={"60%"} height={20} />
          <View style={{ marginTop: 10 }}>
            <Skeleton width={"86%"} height={15} />
            <View style={{ marginTop: 10 }}>
              <Skeleton width={"89%"} height={15} />
              <View style={{ marginTop: 11 }}>
                <Skeleton width={"50%"} height={15} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#00000010",
    borderRadius: 10,
    // width: "48%", // two cards per row
  },
});
