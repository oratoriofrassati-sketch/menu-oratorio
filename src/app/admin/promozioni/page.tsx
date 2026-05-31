"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type Promotion = {
  id: string;
  name: string;
  image: string;
};

type ActivePromotion = {
  promotion_id: string;
  full_price: string;
  promo_price: string;
};

export default function PromozioniPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [activePromotions, setActivePromotions] = useState<
    ActivePromotion[]
  >([]);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: promotionsData } = await supabase
      .from("promotions")
      .select("*");

    const { data: activeData } = await supabase
      .from("active_promotions")
      .select("*")
      .order("sort_order", { ascending: true });

    setPromotions(promotionsData || []);
    setActivePromotions(activeData || []);
  }

  function isActive(id: string) {
    return activePromotions.some(
      (promotion) => promotion.promotion_id === id
    );
  }

  function togglePromotion(id: string) {
    setMessage("");

    if (isActive(id)) {
      setActivePromotions((prev) =>
        prev.filter(
          (promotion) => promotion.promotion_id !== id
        )
      );

      return;
    }

    if (activePromotions.length >= 2) {
      setMessage("Massimo 2 promozioni attive.");
      return;
    }

    setActivePromotions((prev) => [
      ...prev,
      {
        promotion_id: id,
        full_price: "",
        promo_price: "",
      },
    ]);
  }

  function updatePrice(
    promotionId: string,
    field: "full_price" | "promo_price",
    value: string
  ) {
    setActivePromotions((prev) =>
      prev.map((promotion) =>
        promotion.promotion_id === promotionId
          ? {
              ...promotion,
              [field]: value,
            }
          : promotion
      )
    );
  }

  async function savePromotions() {
    setSaving(true);
    setMessage("");

    const { error: deleteError } = await supabase
      .from("active_promotions")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      setMessage("Errore cancellazione.");
      setSaving(false);
      return;
    }

    if (activePromotions.length > 0) {
      const rows = activePromotions.map(
        (promotion, index) => ({
          promotion_id: promotion.promotion_id,
          full_price: promotion.full_price,
          promo_price: promotion.promo_price,
          sort_order: index,
        })
      );

      const { error: insertError } = await supabase
        .from("active_promotions")
        .insert(rows);

      if (insertError) {
        setMessage("Errore salvataggio.");
        setSaving(false);
        return;
      }
    }

    setMessage("Promozioni pubblicate.");
    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-black mb-3">
          Gestione Promozioni
        </h1>

        <p className="text-xl text-blue-100 mb-10">
          Seleziona massimo 2 promozioni del giorno.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((promotion) => {
            const active = activePromotions.find(
              (item) =>
                item.promotion_id === promotion.id
            );

            return (
              <div
                key={promotion.id}
                className={`rounded-3xl p-5 ${
                  active
                    ? "bg-green-700"
                    : "bg-blue-800"
                }`}
              >
                <div className="relative w-full h-56 mb-4">
                  <Image
                    src={promotion.image}
                    alt={promotion.name}
                    fill
                    className="object-contain rounded-2xl"
                  />
                </div>

                <h2 className="text-2xl font-black mb-4">
                  {promotion.name}
                </h2>

                <button
                  onClick={() =>
                    togglePromotion(promotion.id)
                  }
                  className={`w-full rounded-2xl py-4 text-xl font-black mb-4 ${
                    active
                      ? "bg-red-600"
                      : "bg-yellow-400 text-black"
                  }`}
                >
                  {active
                    ? "Rimuovi promozione"
                    : "Attiva promozione"}
                </button>

                {active && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 font-bold">
                        Prezzo pieno
                      </label>

                      <input
                        type="text"
                        value={active.full_price}
                        onChange={(event) =>
                          updatePrice(
                            promotion.id,
                            "full_price",
                            event.target.value
                          )
                        }
                        placeholder="€ 10,00"
                        className="w-full rounded-xl p-3 text-black font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-bold">
                        Prezzo promo
                      </label>

                      <input
                        type="text"
                        value={active.promo_price}
                        onChange={(event) =>
                          updatePrice(
                            promotion.id,
                            "promo_price",
                            event.target.value
                          )
                        }
                        placeholder="€ 8,00"
                        className="w-full rounded-xl p-3 text-black font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={savePromotions}
          disabled={saving}
          className="w-full mt-10 rounded-3xl bg-yellow-400 text-black py-5 text-3xl font-black"
        >
          {saving
            ? "Pubblicazione..."
            : "Pubblica promozioni"}
        </button>

        {message && (
          <p className="mt-6 text-center text-2xl font-black">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}