import CustomButton from "@/components/custom-button";
import { ThemedText } from "@/components/themed-text";
import { addCoffee } from "@/hooks/coffeeApi";
import { readApiSecret, subscribeApiSecret } from "@/hooks/useApiSecret";
import useCoffeeJson from "@/hooks/useCoffeeJson";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";

export default function AddCoffee() {
  const [text, setText] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUri, setImgUri] = useState("");
  const { loading } = useCoffeeJson();
  const [nameError, setNameError] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState("");
  const [descError, setDescError] = useState(false);
  const [descErrorMessage, setDescErrorMessage] = useState("");
  const [imgError, setImgError] = useState(false);
  const [imgErrorMessage, setImgErrorMessage] = useState("");

  const [apiSecret, setApiSecret] = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoadingSecret(true);
    (async () => {
      try {
        const s = await readApiSecret();
        if (!mounted) return;
        setApiSecret(s.trim() === "" ? null : s);
      } catch {
        if (mounted) setApiSecret(null);
      } finally {
        if (mounted) setLoadingSecret(false);
      }
    })();

    const unsub = subscribeApiSecret((v) => {
      if (!mounted) return;
      setApiSecret(v.trim() === "" ? null : v);
    });
    return () => {
      mounted = false;
      unsub();
    };
  }, []);
  const validateInput = (
    text: string,
    setError: React.Dispatch<React.SetStateAction<boolean>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    desc: boolean = false,
    img: boolean = false
  ) => {
    if (desc) {
      setDesc(text);
    } else if (img) {
      setImgUri(text);
    } else {
      setText(text);
    }
    if (text.length < 3) {
      // Example validation rule
      setError(true);
      setErrorMessage("Input must be at least 3 characters.");
    } else {
      setError(false);
      setErrorMessage("");
    }
  };

  if (loading) {
    return (
      <View>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={{ flex: 1 }}>
      <View style={styles.container}>
        {!loadingSecret && apiSecret === null && (
          <ThemedText style={styles.missingSecret}>
            No API secret configured — set it in Settings
          </ThemedText>
        )}
        <ThemedText style={styles.heading}>Add Coffee</ThemedText>
        <View style={{ flexDirection: "column" }}>
          <ThemedText>Name: </ThemedText>
          <TextInput
            style={[styles.input, nameError && styles.errorInput]}
            inputMode="text"
            maxLength={15}
            onChangeText={(text) =>
              validateInput(text, setNameError, setNameErrorMessage)
            }
            value={text}
            placeholder="Enter coffee name"
            placeholderTextColor={"gray"}
          ></TextInput>
          {nameError && (
            <ThemedText style={styles.errorText}>{nameErrorMessage}</ThemedText>
          )}
        </View>

        <View style={{ marginTop: 8 }}>
          <ThemedText>Description:</ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.descInput,
              descError && styles.errorInput,
            ]}
            multiline
            numberOfLines={3}
            onChangeText={(text) =>
              validateInput(text, setDescError, setDescErrorMessage, true)
            }
            value={desc}
            placeholder="Enter description"
            placeholderTextColor="gray"
          />
          {descError && (
            <ThemedText style={styles.errorText}>{descErrorMessage}</ThemedText>
          )}
        </View>

        <View style={{ marginTop: 40 }}>
          <ThemedText>Image URI:</ThemedText>
          <TextInput
            style={[styles.input, imgError && styles.errorInput]}
            onChangeText={(text) =>
              validateInput(text, setImgError, setImgErrorMessage, false, true)
            }
            value={imgUri}
            placeholder="Enter image URL"
            placeholderTextColor="gray"
          />
          {imgError && (
            <ThemedText style={styles.errorText}>{imgErrorMessage}</ThemedText>
          )}
        </View>
      </View>
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <CustomButton
          title="Add Coffee"
          onPress={() =>
            addCoffee({ name: text, description: desc, image: imgUri })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 30,
    marginLeft: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    color: "white",
    borderColor: "gray",
    width: 260,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  errorInput: {
    borderColor: "red", // Change border color on error
  },
  errorText: {
    color: "red", // Style for the error message
    fontSize: 16,
    marginLeft: 11,
  },
  missingSecret: {
    color: "#dc2626",
    marginBottom: 12,
    fontWeight: "600",
  },
  descInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
