import CustomDivider from "@/components/divider";
import { readApiSecret, writeApiSecret } from "@/hooks/useApiSecret";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  // /home/muhammad/react-native-series/app/(tabs)/settings.tsx
  Appearance,
  Button,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";
// Clipboard helper: try to require expo-clipboard, fallback to no-op implementation
let Clipboard: any;
try {
  // prefer dynamic require to avoid type errors if package is not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Clipboard = require("expo-clipboard");
} catch (e) {
  Clipboard = null;
}
const clipboardAvailable = Boolean(
  Clipboard &&
    typeof Clipboard.setStringAsync === "function" &&
    typeof Clipboard.getStringAsync === "function"
);

type ThemeMode = "system" | "light" | "dark";

export default function SettingsScreen() {
  const systemScheme = useColorScheme() || "light"; // 'light' | 'dark'
  const [mode, setMode] = useState<ThemeMode>("system");

  // Determine active theme based on mode and system value
  const activeTheme = mode === "system" ? systemScheme : mode;

  // Apply Appearance.setColorScheme when mode changes.
  useEffect(() => {
    // Appearance.setColorScheme is not officially documented for production use in some RN versions.
    // Use optional chaining/any to avoid type errors if it's not available.
    const setter = (Appearance as any)?.setColorScheme;
    if (typeof setter === "function") {
      // pass undefined/null to follow system, otherwise 'light' or 'dark'
      setter(mode === "system" ? undefined : mode);
    }
  }, [mode]);

  const isDark = activeTheme === "dark";

  // API secret handling
  const [apiSecret, setApiSecret] = useState<string>("");
  const [loadingSecret, setLoadingSecret] = useState<boolean>(true);
  const [secureEntry, setSecureEntry] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingSecret(true);
      try {
        const content = await readApiSecret();
        if (mounted) setApiSecret(content ?? "");
      } catch (e) {
        if (mounted) setApiSecret("");
      } finally {
        if (mounted) setLoadingSecret(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const saveApiSecret = async (value?: string) => {
    const toWrite = value !== undefined ? value : apiSecret;
    try {
      await writeApiSecret(toWrite ?? "");
      setApiSecret(toWrite ?? "");
      Alert.alert("Saved", "API secret saved to document directory");
    } catch (e) {
      Alert.alert("Error", "Failed to save API secret");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#f7f7fb" },
      ]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View
        style={[
          styles.card,
          { backgroundColor: isDark ? "#27282cff" : "#fff" },
        ]}
      >
        <Text style={[styles.heading, { color: isDark ? "#fff" : "#111" }]}>
          Appearance
        </Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text
              style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}
            >
              Use System Appearance
            </Text>
            <Text
              style={[styles.sub, { color: isDark ? "#9ca3af" : "#6b7280" }]}
            >
              Follows device theme
            </Text>
          </View>
          <Switch
            value={mode === "system"}
            onValueChange={(v) => setMode(v ? "system" : "light")}
          />
        </View>
        <CustomDivider />
        <View style={styles.row}>
          <View style={styles.col}>
            <Text
              style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}
            >
              API Secret
            </Text>
            <Text
              style={[styles.sub, { color: isDark ? "#9ca3af" : "#6b7280" }]}
            >
              Stored in app document directory
            </Text>
          </View>
          <View style={{ width: 220, alignItems: "flex-end" }}>
            {loadingSecret ? (
              <ActivityIndicator />
            ) : (
              <View style={{ width: "100%" }}>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.secretInput,
                      {
                        flex: 1,
                        backgroundColor: isDark ? "#1f1f23" : "#f3f4f6",
                        color: isDark ? "#fff" : "#111",
                      },
                    ]}
                    value={apiSecret}
                    onChangeText={setApiSecret}
                    placeholder="(empty)"
                    placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                    secureTextEntry={secureEntry}
                    onEndEditing={() => saveApiSecret()}
                    returnKeyType="done"
                  />
                  <View style={styles.iconButtonWrap}>
                    <Text
                      onPress={() => setSecureEntry((s) => !s)}
                      style={[
                        styles.iconButton,
                        { color: isDark ? "#fff" : "#111" },
                      ]}
                    >
                      {secureEntry ? "👁️" : "🔓"}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Button
                    title="Copy"
                    onPress={async () => {
                      if (!clipboardAvailable) {
                        Alert.alert(
                          "Clipboard unavailable",
                          "Install the expo-clipboard package: `expo install expo-clipboard`"
                        );
                        return;
                      }
                      try {
                        await Clipboard.setStringAsync(apiSecret ?? "");
                        Alert.alert("Copied", "API secret copied to clipboard");
                      } catch {
                        Alert.alert("Error", "Failed to copy to clipboard");
                      }
                    }}
                  />
                  <View style={{ width: 12 }} />
                  <Button
                    title="Paste"
                    onPress={async () => {
                      if (!clipboardAvailable) {
                        Alert.alert(
                          "Clipboard unavailable",
                          "Install the expo-clipboard package: `expo install expo-clipboard`"
                        );
                        return;
                      }
                      try {
                        const val = await Clipboard.getStringAsync();
                        setApiSecret(val ?? "");
                      } catch {
                        Alert.alert("Error", "Failed to read from clipboard");
                      }
                    }}
                  />
                </View>
              </View>
            )}
            <View style={{ marginTop: 8 }}>
              <Button title="Save" onPress={() => saveApiSecret()} />
            </View>
          </View>
        </View>
        <CustomDivider />
        <View style={styles.row}>
          <View style={styles.col}>
            <Text
              style={[styles.label, { color: isDark ? "#d1d5db" : "#374151" }]}
            >
              Dark Mode
            </Text>
            <Text
              style={[styles.sub, { color: isDark ? "#9ca3af" : "#6b7280" }]}
            >
              Manual override for dark theme
            </Text>
          </View>
          <Switch
            value={mode === "dark"}
            onValueChange={(v) => setMode(v ? "dark" : "light")}
            disabled={mode === "system"}
          />
        </View>
        <CustomDivider />
        <View style={styles.preview}>
          <Text style={{ color: isDark ? "#e6eef8" : "#0b1220" }}>
            Current active theme: {activeTheme}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    minHeight: "100%",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    // shadow for ios
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    // elevation for android
    elevation: 2,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  col: {
    flex: 1,
    paddingRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  sub: {
    fontSize: 13,
    marginTop: 2,
  },
  preview: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secretInput: {
    width: "100%",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButtonWrap: {
    marginLeft: 8,
  },
  iconButton: {
    fontSize: 18,
    padding: 6,
  },
  actionRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
});
