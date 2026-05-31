"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  sort_order: number;
  quantity: string | null;
  subtitle: string | null;
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeMenuIds, setActiveMenuIds] = useState<string[]>([]);
  const [fastFoodOpen, setFastFoodOpen] = useState(true);
  const [menuDate, setMenuDate] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const savedLogin = localStorage.getItem("fast-food-admin");

    if (savedLogin === "ok") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    async function loadData() {
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("sort_order", { ascending: true });

      const visibleProducts = (productsData || []).filter(
        (product) =>
          product.id !== "combo-bibita" &&
          product.id !== "combo-birra"
      );

      const sortedProducts = visibleProducts.sort((a, b) => {
        const aIsLast = a.id === "frutta" || a.id === "dolce";
        const bIsLast = b.id === "frutta" || b.id === "dolce";

        if (aIsLast && !bIsLast) return 1;
        if (!aIsLast && bIsLast) return -1;

        return (a.sort_order ?? 0) - (b.sort_order ?? 0);
      });

      const { data: activeMenuData } = await supabase
        .from("active_menu")
        .select("*");

      const { data: settingsData } = await supabase
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

      setProducts(sortedProducts);

      setActiveMenuIds(
        activeMenuData?.map((item) => item.product_id) || []
      );

      setFastFoodOpen(settingsData?.fast_food_open ?? true);
      setMenuDate(settingsData?.menu_date ?? "");
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

  function updatePrice(productId: string, newPrice: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, price: newPrice }
          : product
      )
    );
  }

  function updateQuantity(productId: string, newQuantity: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, quantity: newQuantity }
          : product
      )
    );
  }

  function updateSubtitle(productId: string, newSubtitle: string) {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? { ...product, subtitle: newSubtitle }
          : product
      )
    );
  }

  function moveProductUp(index: number) {
    if (index === 0) return;

    const updated = [...products];

    [updated[index - 1], updated[index]] = [
      updated[index],
      updated[index - 1],
    ];

    setProducts(updated);
    setMessage("");
  }

  function moveProductDown(index: number) {
    if (index === products.length - 1) return;

    const updated = [...products];

    [updated[index + 1], updated[index]] = [
      updated[index],
      updated[index + 1],
    ];

    setProducts(updated);
    setMessage("");
  }

  async function publishMenu() {
    setIsSaving(true);
    setMessage("");

    for (const [index, product] of products.entries()) {
      const { error } = await supabase
        .from("products")
        .update({
          price: product.price,
          quantity: product.quantity || "",
          subtitle: product.subtitle || "",
          sort_order: index * 10,
        })
        .eq("id", product.id);

      if (error) {
        setMessage(`Errore salvataggio ${product.name}`);
        setIsSaving(false);
        return;
      }
    }

    const { error: deleteError } = await supabase
      .from("active_menu")
      .delete()
      .neq("product_id", "");

    if (deleteError) {
      setMessage("Errore svuotamento menu.");
      setIsSaving(false);
      return;
    }

    const filteredActiveMenuIds = activeMenuIds.filter(
      (id) => id !== "combo-bibita" && id !== "combo-birra"
    );

    if (filteredActiveMenuIds.length > 0) {
      const rows = filteredActiveMenuIds.map((id) => ({
        product_id: id,
      }));

      const { error: insertError } = await supabase
        .from("active_menu")
        .insert(rows);

      if (insertError) {
        setMessage("Errore inserimento menu.");
        setIsSaving(false);
        return;
      }
    }

    const { error: settingsError } = await supabase
      .from("settings")
      .upsert({
        id: 1,
        fast_food_open: fastFoodOpen,
        menu_date: menuDate || null,
      });

    if (settingsError) {
      setMessage("Errore salvataggio impostazioni.");
      setIsSaving(false);
      return;
    }

    setMessage(
      fastFoodOpen
        ? "Menu pubblicato. Fast Food aperto."
        : "Menu pubblicato. Fast Food chiuso."
    );

    setIsSaving(false);
  }

  function login() {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      localStorage.setItem("fast-food-admin", "ok");
      setIsLoggedIn(true);
      setMessage("");
    } else {
      setMessage("Password errata.");
    }
  }

  function logout() {
    localStorage.removeItem("fast-food-admin");
    setIsLoggedIn(false);
    setPassword("");
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
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                login();
              }
            }}
            placeholder="Password"
            className="w-full rounded-xl p-4 text-black mb-4"
          />

          <button
            onClick={login}
            className="w-full rounded-2xl bg-yellow-400 text-blue-950 font-black text-xl py-4"
          >
            Entra
          </button>

          {message && (
            <p className="mt-4 font-bold">{message}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-5xl font-black mb-4">
              Gestione Menu Cucina
            </h1>

            <p className="text-blue-100">
              Seleziona i prodotti, modifica prezzi e quantità,
              ordina le voci e poi premi Pubblica.
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-xl bg-blue-700 px-4 py-2 font-bold"
          >
            Esci
          </button>
        </div>

        <Link
          href="/admin/promozioni"
          className="block mb-8 rounded-3xl bg-yellow-400 text-blue-950 text-center text-2xl font-black py-5"
        >
          Gestisci promozioni
        </Link>

        <div className="mb-8 bg-blue-800 rounded-3xl p-6 space-y-6">
          <div>
            <label className="block mb-2 text-xl font-black">
              Data del menu
            </label>

            <input
              type="date"
              value={menuDate}
              onChange={(event) =>
                setMenuDate(event.target.value)
              }
              className="w-full rounded-xl p-4 text-black text-xl font-bold"
            />
          </div>

          <button
            onClick={() => {
              setFastFoodOpen(!fastFoodOpen);
              setMessage("");
            }}
            className={`w-full rounded-2xl py-5 text-2xl font-black ${
              fastFoodOpen ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {fastFoodOpen
              ? "FAST FOOD APERTO"
              : "FAST FOOD CHIUSO"}
          </button>
        </div>

        <div className="bg-blue-800 rounded-3xl p-6 space-y-6 mb-8">
          {products.map((product, index) => {
            const isActive =
              activeMenuIds.includes(product.id);

            const canHaveSubtitle =
              product.id === "frutta" ||
              product.id === "dolce";

            return (
              <div
                key={product.id}
                className="bg-blue-700 rounded-2xl p-4"
              >
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => moveProductUp(index)}
                    disabled={index === 0}
                    className="bg-yellow-400 text-black rounded-lg px-4 py-2 font-black disabled:opacity-40"
                  >
                    ↑
                  </button>

                  <button
                    onClick={() => moveProductDown(index)}
                    disabled={index === products.length - 1}
                    className="bg-yellow-400 text-black rounded-lg px-4 py-2 font-black disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>

                <button
                  onClick={() => toggleProduct(product.id)}
                  className={`w-full p-4 rounded-2xl text-left mb-4 ${
                    isActive ? "bg-green-600" : "bg-blue-600"
                  }`}
                >
                  <div className="font-bold text-xl">
                    {product.name}
                  </div>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold">
                      Prezzo
                    </label>

                    <input
                      type="text"
                      value={product.price}
                      onChange={(event) =>
                        updatePrice(product.id, event.target.value)
                      }
                      className="w-full rounded-xl p-3 text-black text-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-bold">
                      Quantità disponibile
                    </label>

                    <input
                      type="text"
                      value={product.quantity || ""}
                      onChange={(event) =>
                        updateQuantity(product.id, event.target.value)
                      }
                      placeholder="Es. 40"
                      className="w-full rounded-xl p-3 text-black text-xl font-bold"
                    />
                  </div>
                </div>

                {canHaveSubtitle && (
                  <div className="mt-3">
                    <label className="block mb-1 font-bold">
                      Specifica frutta/dolce
                    </label>

                    <input
                      type="text"
                      value={product.subtitle || ""}
                      onChange={(event) =>
                        updateSubtitle(product.id, event.target.value)
                      }
                      placeholder="Es. anguria, crostata, gelato..."
                      className="w-full rounded-xl p-3 text-black text-xl font-bold"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={publishMenu}
          disabled={isSaving}
          className="w-full rounded-2xl bg-yellow-400 text-blue-950 font-black text-2xl py-5 disabled:opacity-50"
        >
          {isSaving ? "Pubblicazione..." : "Pubblica menu"}
        </button>

        {message && (
          <p className="mt-6 text-xl font-bold text-center">
            {message}
          </p>
        )}

        <a
          href="/"
          target="_blank"
          className="block mt-10 text-center text-2xl font-black underline"
        >
          Apri volantino menu
        </a>

        <a
          href="/tv"
          target="_blank"
          className="block mt-4 text-center text-2xl font-black underline"
        >
          Apri versione TV
        </a>
      </div>
    </main>
  );
}