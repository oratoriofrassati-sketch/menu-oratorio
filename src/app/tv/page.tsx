import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  sort_order: number;
  subtitle: string | null;
};

type ActivePromotionRow = {
  promotion_id: string;
  full_price: string;
  promo_price: string;
  sort_order: number;
  promotions:
    | {
        id: string;
        name: string;
        image: string;
      }
    | {
        id: string;
        name: string;
        image: string;
      }[];
};

type PromotionView = {
  promotion_id: string;
  full_price: string;
  promo_price: string;
  sort_order: number;
  promotion: {
    id: string;
    name: string;
    image: string;
  };
};

function formatMenuDate(menuDate?: string | null) {
  const date = menuDate
    ? new Date(`${menuDate}T12:00:00`)
    : new Date();

  return new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Rome",
  }).format(date);
}

function getDisplayName(product: Product) {
  if (product.id === "nuggets-pollo") {
    return "Nuggets di pollo (9 pezzi)";
  }

  return product.name;
}

export default async function TvPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });

  const { data: activeMenu } = await supabase
    .from("active_menu")
    .select("*");

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  const { data: activePromotions } = await supabase
    .from("active_promotions")
    .select(
      `
      promotion_id,
      full_price,
      promo_price,
      sort_order,
      promotions (
        id,
        name,
        image
      )
    `
    )
    .order("sort_order", { ascending: true })
    .limit(2);

  const fastFoodOpen = settings?.fast_food_open ?? true;
  const menuDate = formatMenuDate(settings?.menu_date);

  const activeIds =
    activeMenu?.map((item) => item.product_id) || [];

  const activeProducts =
    products?.filter((product: Product) =>
      activeIds.includes(product.id)
    ) || [];

  const promotions: PromotionView[] = (
    (activePromotions || []) as ActivePromotionRow[]
  )
    .map((item) => ({
      promotion_id: item.promotion_id,
      full_price: item.full_price,
      promo_price: item.promo_price,
      sort_order: item.sort_order,
      promotion: Array.isArray(item.promotions)
        ? item.promotions[0]
        : item.promotions,
    }))
    .filter((item) => item.promotion);

  const frittiProducts = activeProducts.filter(
    (product: Product) =>
      product.id === "patatine" ||
      product.id === "nuggets-pollo"
  );

  const dessertProducts = activeProducts.filter(
    (product: Product) =>
      product.id === "frutta" ||
      product.id === "dolce"
  );

  const paniniProducts = activeProducts.filter(
    (product: Product) =>
      product.id !== "patatine" &&
      product.id !== "nuggets-pollo" &&
      product.id !== "frutta" &&
      product.id !== "dolce" &&
      product.id !== "combo-bibita" &&
      product.id !== "combo-birra"
  );

  return (
    <main className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <section className="relative aspect-video w-full max-w-[1920px] overflow-hidden bg-black text-white">
        {fastFoodOpen ? (
          <div className="grid h-full grid-cols-[360px_1fr_620px] grid-rows-[1fr_260px] gap-3 p-3 font-[family-name:var(--font-caveat)]">
            {/* COLONNA SINISTRA: DATA + PROMOZIONI */}

            <aside
              className="col-start-1 col-end-2 row-start-1 row-end-3 flex flex-col overflow-hidden border-r-4 border-black"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="px-4 pt-5 text-center drop-shadow-xl">
                <p className="text-5xl font-black uppercase leading-none">
                  Menu di
                </p>

                <p className="mt-3 text-4xl font-black uppercase leading-none">
                  {menuDate}
                </p>
              </div>

              <div className="my-5 border-t-4 border-yellow-300" />

              <p className="px-3 text-center text-4xl font-black uppercase leading-none text-yellow-300 drop-shadow-xl">
                La Promozione di oggi
              </p>

              <div className="mt-5 flex flex-1 flex-col gap-6 px-5">
                {promotions.map((promo) => (
                  <article
                    key={promo.promotion_id}
                    className="text-center"
                  >
                    <div className="relative mx-auto h-56 w-full">
                      <Image
                        src={promo.promotion.image}
                        alt={promo.promotion.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <div className="mt-2 flex items-end justify-center gap-4">
                      <p className="text-3xl font-black leading-none line-through opacity-75">
                        {promo.full_price}
                      </p>

                      <p className="text-6xl font-black leading-none text-yellow-300 drop-shadow-xl">
                        {promo.promo_price}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-auto border-t-4 border-yellow-300 px-4 py-4 text-center">
                <p className="text-xl font-black italic">
                  Menu soggetto a disponibilità
                </p>
              </div>
            </aside>

            {/* CENTRO: PANINI */}

            <section
              className="col-start-2 col-end-3 row-start-1 row-end-2 overflow-hidden px-4 py-4"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="mb-2 text-center text-4xl font-black uppercase leading-none drop-shadow-xl">
                Panini
              </h2>

              <div className="grid h-[calc(100%-3rem)] grid-cols-2 grid-rows-2 gap-x-8 gap-y-4">
                {paniniProducts.slice(0, 4).map((product: Product) => (
                  <article
                    key={product.id}
                    className="text-center"
                  >
                    <div className="relative mx-auto h-44 w-full">
                      <Image
                        src={product.image}
                        alt={getDisplayName(product)}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <h3 className="mt-1 text-[1.75rem] font-black uppercase leading-none drop-shadow-lg">
                      {getDisplayName(product)}
                    </h3>

                    <p className="mt-1 text-3xl font-black leading-none drop-shadow-lg">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* DESTRA ALTA: FRITTI */}

            <section
              className="col-start-3 col-end-4 row-start-1 row-end-2 overflow-hidden px-5 py-4"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <h2 className="mb-4 text-center text-4xl font-black uppercase leading-none drop-shadow-xl">
                Fritti
              </h2>

              <div className="grid h-[calc(100%-3rem)] grid-cols-2 gap-8">
                {frittiProducts.map((product: Product) => (
                  <article
                    key={product.id}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative h-52 w-full">
                      <Image
                        src={product.image}
                        alt={getDisplayName(product)}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <h3 className="mt-2 text-[1.75rem] font-black uppercase leading-none drop-shadow-lg">
                      {getDisplayName(product)}
                    </h3>

                    <p className="mt-2 text-3xl font-black leading-none drop-shadow-lg">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* DESTRA BASSA SINISTRA: DESSERT */}

            <section
              className="col-start-2 col-end-3 row-start-2 row-end-3 overflow-hidden px-5 py-4"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="grid h-full grid-cols-2 gap-4">
                {dessertProducts.map((product: Product) => (
                  <article
                    key={product.id}
                    className="flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative h-36 w-full">
                      <Image
                        src={product.image}
                        alt={getDisplayName(product)}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <h3 className="text-[1.45rem] font-black uppercase leading-none drop-shadow-lg">
                      {getDisplayName(product)}
                    </h3>

                    {product.subtitle && (
                      <p className="text-[1.2rem] font-black uppercase leading-none text-yellow-300 drop-shadow-lg">
                        {product.subtitle}
                      </p>
                    )}

                    <p className="mt-1 text-2xl font-black leading-none drop-shadow-lg">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* DESTRA BASSA: FOOTER COMBO */}

            <section
              className="col-start-3 col-end-4 row-start-2 row-end-3 overflow-hidden px-5 py-4"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="relative h-full w-full">
                <Image
                  src="/menu-combo-footer.jpg"
                  alt="Menu combo"
                  fill
                  className="object-contain drop-shadow-2xl"
                />
              </div>
            </section>
          </div>
        ) : (
          <div
            className="flex h-full items-center justify-center font-[family-name:var(--font-caveat)]"
            style={{
              backgroundImage: "url('/menu-bg.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="rounded-[2rem] bg-white/95 px-16 py-14 text-center text-[#12377a] shadow-2xl">
              <p className="text-7xl font-black uppercase leading-tight">
                Questa sera
                <br />
                il Fast Food
                <br />
                è chiuso
              </p>

              <p className="mt-8 text-4xl font-bold">
                Vi aspettiamo alla prossima serata!
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}