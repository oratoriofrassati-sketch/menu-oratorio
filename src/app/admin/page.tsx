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

  useEffect(() => {
    async function loadData() {
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .order("name");

      const { data: activeMenuData } = await supabase
        .from("active_menu")
        .select("*");

      setProducts(productsData || []);
      setActiveMenuIds(
        activeMenuData?.map((item) => item.product_id) || []
      );
    }

    loadData();
  }, []);

  function toggleProduct(productId: string) {
    setMessage("");

    if (activeMenuIds.includes(productId)) {
      setActiveMenuIds(activeMenuIds.filter((id) => id !== productId));
    } else {
      setActiveMenuIds([...activeMenuIds, productId]);
    }
  }

  async function publishMenu() {
    setIsSaving(true);
    setMessage("");

    const { error: deleteError } = await supabase
      .from("active_menu")
      .delete()
      .neq("product_id", "");

    if (deleteError) {
      setMessage("Errore durante lo svuotamento del menu.");
      setIsSaving(false);
      return;
    }

    if (activeMenuIds.length > 0) {
      const rows = activeMenuIds.map((id) => ({
        product_id: id,
      }));

      const { error: insertError } = await supabase
        .from("active_menu")
        .insert(rows);

      if (insertError) {
        setMessage("Errore durante il salvataggio del menu.");
        setIsSaving(false);
        return;
      }
    }

    setMessage("Menu pubblicato correttamente.");
    setIsSaving(false);
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-black mb-4">
          Gestione Menu Cucina
        </h1>

        <p className="mb-8 text-blue-100">
          Seleziona i prodotti disponibili e poi premi Pubblica.
        </p>

        <div className="bg-blue-800 rounded-3xl p-6 space-y-4 mb-8">
          {products.map((product) => {
            const isActive = activeMenuIds.includes(product.id);

            return (
              <button
                key={product.id}
                onClick={() => toggleProduct(product.id)}
                className={`w-full p-4 rounded-2xl text-left transition ${
                  isActive ? "bg-green-600" : "bg-blue-700"
                }`}
              >
                <div className="font-bold">
                  {product.name}
                </div>

                <div>
                  {product.price}
                </div>
              </button>
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
          <p className="mt-6 text-xl font-bold">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}