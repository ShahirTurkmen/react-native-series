import { File, Paths } from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { useState } from "react";

const documentDirectory =
  Paths?.document ?? (FileSystemLegacy as any)?.documentDirectory ?? "";
documentDirectory.exists ||
  documentDirectory.create({ idempotent: true, intermediates: true });
const file = new File(`${documentDirectory.uri}/api_secret.txt`);
if (!file.exists) file.create({ intermediates: true });
export const API_SECRET_FILE = file.uri;
export function useReadApiSecretSync(): string {
  const [response, setResponse] = useState<string>();
  async function insider() {
    try {
      const info = await FileSystemLegacy.getInfoAsync(API_SECRET_FILE);
      if (!info.exists) {
        await FileSystemLegacy.writeAsStringAsync(API_SECRET_FILE, "", {
          encoding: "utf8",
        });
        return "";
      }
      const content = await FileSystemLegacy.readAsStringAsync(
        API_SECRET_FILE,
        {
          encoding: "utf8",
        }
      );
      return content ?? "";
    } catch (error) {
      console.error("Error reading API secret:", error);
      return "";
    }
  }
  insider().then((res) => setResponse(res));
  setTimeout(() => {}, 1000);

  return response ?? "";
}
export async function readApiSecret(): Promise<string> {
  try {
    const info = await FileSystemLegacy.getInfoAsync(API_SECRET_FILE);
    if (!info.exists) {
      await FileSystemLegacy.writeAsStringAsync(API_SECRET_FILE, "", {
        encoding: "utf8",
      });
      return "";
    }
    const content = await FileSystemLegacy.readAsStringAsync(API_SECRET_FILE, {
      encoding: "utf8",
    });
    return content ?? "";
  } catch (e) {
    console.error("Error reading API secret:", e);
    return "";
  }
}

export async function writeApiSecret(value: string): Promise<void> {
  try {
    await FileSystemLegacy.writeAsStringAsync(API_SECRET_FILE, value ?? "", {
      encoding: "utf8",
    });
    // notify subscribers about the change
    try {
      const v = value ?? "";
      _notifyApiSecretSubscribers(v);
    } catch {}
  } catch (e) {
    console.error("Error writing API secret:", e);
  }
}

export async function ensureApiSecretFile(): Promise<void> {
  try {
    const info = await FileSystemLegacy.getInfoAsync(API_SECRET_FILE);
    if (!info.exists) {
      await FileSystemLegacy.writeAsStringAsync(API_SECRET_FILE, "", {
        encoding: "utf8",
      });
    }
  } catch (e) {
    console.error("Error ensuring API secret file:", e);
  }
}

type ApiSecretListener = (value: string) => void;
const _listeners = new Set<ApiSecretListener>();
export function subscribeApiSecret(listener: ApiSecretListener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}
function _notifyApiSecretSubscribers(value: string) {
  _listeners.forEach((l) => {
    try {
      l(value);
    } catch (e) {
      // ignore
    }
  });
}
