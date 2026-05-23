"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeMenuIds, setActiveMenuIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [fastFoodOpen, setFastFoodOpen] =
    useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("name");

      const { data: activeMenuData } = await supabase
        .from("active_menu")
        .select("*");

      const { data: settingsData } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

      setProducts(productsData || []);

      setActiveMenuIds(
        activeMenuData?.map((item) => item.product_id) || []
      );

      setFastFoodOpen(
        settingsData?.fast_food_open ?? true
      );
    }

    if (isLoggedIn) {
      loadData();
    }
  }, [isLoggedIn]);

  function toggleProduct(productId: string) {
    setMessage("");

    if (activeMenuIds.includes(productId)) {
      setActiveMenuIds(
        activeMenuIds.filter((id) => id !== productId)
      );
    } else {
      setActiveMenuIds([...activeMenuIds, productId]);
    }
  }

  function updatePrice(
    productId: string,
    newPrice: string
  ) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              price: newPrice,
            }
          : product
      )
    );
  }

  async function publishMenu() {
    setIsSaving(true);
    setMessage("");

    for (const product of products) {
      await supabase
        .from("products")
        .update({
          price: product.price,
        })
        .eq("id", product.id);
    }

    await supabase
      .from("active_menu")
      .delete()
      .neq("product_id", "");

    if (activeMenuIds.length > 0) {
      const rows = activeMenuIds.map((id) => ({
        product_id: id,
      }));

      await supabase
        .from("active_menu")
        .insert(rows);
    }

    await supabase
      .from("settings")
      .update({
        fast_food_open: fastFoodOpen,
      })
      .eq("id", 1);

    setMessage("Menu pubblicato.");
    setIsSaving(false);
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-blue-900 text-white p-8 flex items-center justify-center">
        <div className="bg-blue-800 rounded-3xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-black mb-6">
            Accesso cucina
          </h1>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Password"
            className="w-full rounded-xl p-4 text-black mb-4"
          />

          <button
            onClick={() => {
              if (
                password ===
                process.env.NEXT_PUBLIC_ADMIN_PASSWORD
              ) {
                setIsLoggedIn(true);
                setMessage("");
              } else {
                setMessage("Password errata.");
              }
            }}
            className="w-full rounded-2xl bg-yellow-400 text-blue-950 font-black text-xl py-4"
          >
            Entra
          </button>

          {message && (
            <p className="mt-4 font-bold">
              {message}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black mb-4">
          Gestione Menu Cucina
        </h1>

        <div className="mb-8 bg-blue-800 rounded-3xl p-6">
          <button
            onClick={() =>
              setFastFoodOpen(!fastFoodOpen)
            }
            className={`w-full rounded-2xl py-5 text-2xl font-black ${
              fastFoodOpen
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {fastFoodOpen
              ? "FAST FOOD APERTO"
              : "FAST FOOD CHIUSO"}
          </button>
        </div>

        <div className="bg-blue-800 rounded-3xl p-6 space-y-6 mb-8">
          {products.map((product) => {
            const isActive =
              activeMenuIds.includes(product.id);

            return (
              <div
                key={product.id}
                className="bg-blue-700 rounded-2xl p-4"
              >
                <button
                  onClick={() =>
                    toggleProduct(product.id)
                  }
                  className={`w-full p-4 rounded-2xl text-left mb-4 ${
                    isActive
                      ? "bg-green-600"
                      : "bg-blue-600"
                  }`}
                >
                  <div className="font-bold text-xl">
                    {product.name}
                  </div>
                </button>

                <input
                  type="text"
                  value={product.price}
                  onChange={(event) =>
                    updatePrice(
                      product.id,
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl p-3 text-black text-xl font-bold"
                />
              </div>
            );
          })}
        </div>

        <button
          onClick={publishMenu}
          disabled={isSaving}
          className="w-full rounded-2xl bg-yellow-400 text-blue-950 font-black text-2xl py-5 disabled:opacity-50"
        >
          {isSaving
            ? "Pubblicazione..."
            : "Pubblica menu"}
        </button>

        {message && (
          <p className="mt-6 text-xl font-bold">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}