import SkeletonComponent from "@/components/skeleton-explore";
import { ThemedText } from "@/components/themed-text";
import { subscribeCoffeeApi } from "@/hooks/coffeeApi";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import useCoffeeJson from "@/hooks/useCoffeeJson";
import { Skeleton } from "moti/skeleton";
import React, { useEffect } from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
const CustomCard = ({
  title,
  img,
  desc,
}: {
  title: string;
  img: string;
  desc: string;
}) => {
  const colorScheme = useColorScheme();
  function isString(value: any): value is string {
    return typeof value === "string";
  }
  console.log("Image source:", img);
  return (
    <View
      style={[
        styles.card,
        colorScheme === "dark"
          ? {
              // iOS Shadow
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              // Android Shadow
              elevation: 5,
            }
          : {},
      ]}
    >
      <Image
        //@ts-ignore
        source={
          isString(img) ?? img.includes("http")
            ? {
                uri: img,
              }
            : img
        }
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <ThemedText
          style={styles.cardTitle}
          coffeeColor={colorScheme === "dark" ? "#9f9797ff" : "black"}
        >
          {title}
        </ThemedText>
        <ThemedText
          coffeeColor={colorScheme === "dark" ? "#9f9797ff" : "black"}
        >
          {desc}
        </ThemedText>
      </View>
    </View>
  );
};

export default function Explore() {
  const [subscribed, setSubscribed] = React.useState(false);
  const { loading, coffees, reload } = useCoffeeJson();
  useEffect(() => {
    const unsubscribe = subscribeCoffeeApi((value) => {
      setSubscribed(value);
      try {
        if (typeof reload === "function") reload();
      } catch (e) {
        // ignore reload errors
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);
  if (loading) {
    return (
      <View>
        <View
          style={{
            flex: 1,
            paddingTop: 45,
            paddingLeft: 15,
          }}
        >
          <Skeleton width={230} height={20} />
        </View>
        <View style={[styles.grid]}>
          <SkeletonComponent />
          <SkeletonComponent />
        </View>
        <View style={styles.grid}>
          <SkeletonComponent />
          <SkeletonComponent />
        </View>
      </View>
    );
  }
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
      <View style={styles.container}>
        <ThemedText style={styles.headerText}>Explore Some Coffees:</ThemedText>
        <View style={styles.grid}>
          {coffees?.map((coffee, index) => (
            <CustomCard
              key={index}
              title={coffee.name}
              img={coffee.imageUri}
              desc={coffee.description}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#00000010",
    borderColor: "#4f4b4bff",
    borderWidth: 2,
    borderRadius: 10,
    width: "48%", // two cards per row
    marginBottom: 15,
  },
  cardImage: {
    height: 150,
    width: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});
