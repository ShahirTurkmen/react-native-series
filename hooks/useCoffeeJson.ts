import { getCoffees } from "@/hooks/coffeeApi";
import { useEffect, useState } from "react";

export type CoffeeItem = {
  id: number;
  name: string;
  description: string;
  imageUri: string;
};
export type CoffeeMapped = { name: string; desc: string; img: string };

// No hard-coded coffee data or bundled asset handling here.
// Data is sourced from the remote API or the persisted local JSON file.

async function fetchRemoteCoffees(): Promise<CoffeeItem[]> {
  const data = await getCoffees();
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,

    imageUri: c.image,
  }));
}

export default function useCoffeeJson() {
  const [coffees, setCoffees] = useState<CoffeeItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  async function ensureData() {
    setLoading(true);
    try {
      const remote = await fetchRemoteCoffees();
      setCoffees(remote ?? []);
    } catch (e) {
      console.error("Error ensuring coffee data:", e);
      setCoffees([]);
    } finally {
      setLoading(false);
    }
  }

  async function reload() {
    setLoading(true);
    try {
      const remote = await fetchRemoteCoffees();
      setCoffees(remote ?? []);
    } catch {
      setCoffees([]);
    } finally {
      setLoading(false);
    }
  }

  async function getCoffeeList(): Promise<CoffeeMapped[]> {
    if (!coffees || !coffees.length) return [];
    return coffees.map((c) => ({
      name: c.name,
      desc: c.description,
      img: c.imageUri,
    }));
  }

  useEffect(() => {
    ensureData();
  }, []);

  return {
    coffees,
    loading,
    reload,
    jsonFileUri: undefined,
    // helper that resolves and maps items to {name, desc, img}
    getCoffeeList,
  };
}
