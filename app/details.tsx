import { ThemedText } from "@/components/themed-text";
import { getCoffeeById } from "@/hooks/coffeeApi";
import { Stack, useLocalSearchParams } from "expo-router";
import { Skeleton } from "moti/skeleton";
import React, { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

interface DetailsProps {
  id: number;
}
interface DetailsState {
  id: number;
  description: string;
  image: string;
  name: string;
}

export default function Details() {
  const [details, setDetails] = React.useState(null as DetailsState | null);
  const { id } = useLocalSearchParams() as unknown as DetailsProps;
  useEffect(() => {
    (async () => {
      const coffee = await getCoffeeById(id);
      setDetails({
        id: coffee.id,
        description: coffee.description,
        image: coffee.image,
        name: coffee.name,
      });
    })();
  }, []);
  return (
    <>
      <Stack.Screen
        options={{ title: details ? details.name : "Loading..." }}
      />

      <View style={styles.container}>
        {details ? (
          <View>
            <Image source={{ uri: details.image }} style={styles.image} />
            <ThemedText
              style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}
            >
              {details.name}
            </ThemedText>
            <ThemedText style={{ fontSize: 16 }}>
              {details.description}
            </ThemedText>
          </View>
        ) : (
          <View>
            <Skeleton width={"100%"} height={200} />
            <View style={{ marginTop: 20 }}>
              <Skeleton width={"35%"} height={30} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Skeleton width={"94%"} height={30} />
            </View>
            <View style={{ marginTop: 10 }}>
              <Skeleton width={"50%"} height={30} />
            </View>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 20,
  },
});
