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

  const sideProducts = activeProducts.filter(
    (product: Product) =>
      product.id === "patatine" ||
      product.id === "nuggets-pollo" ||
      product.id === "frutta" ||
      product.id === "dolce"
  );

  const mainProducts = activeProducts.filter(
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
      <section
        className="relative aspect-video w-full max-w-[1920px] overflow-hidden text-white"
        style={{
          backgroundImage: "url('/menu-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/25" />

        <div className="relative z-10 flex h-full flex-col px-10 py-6 font-[family-name:var(--font-caveat)]">
          {fastFoodOpen ? (
            <>
              <header className="mb-4 flex items-center justify-between">
                <div className="relative h-32 w-64">
                  <Image
                    src="/fast-food-logo.png"
                    alt="Frassati Fast Food"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <div className="text-right drop-shadow-xl">
                  <p className="text-5xl font-black uppercase leading-none">
                    Menu di
                  </p>

                  <p className="mt-2 text-4xl font-black uppercase leading-none">
                    {menuDate}
                  </p>
                </div>
              </header>

              {promotions.length > 0 && (
                <section className="mb-4 rounded-[2rem] border-4 border-yellow-300/80 bg-black/40 px-7 py-4">
                  <p className="mb-3 text-center text-5xl font-black uppercase leading-none text-yellow-300 drop-shadow-xl">
                    La Promozione di oggi
                  </p>

                  <div className="grid grid-cols-2 gap-8">
                    {promotions.map((promo) => (
                      <article
                        key={promo.promotion_id}
                        className="flex items-center justify-center gap-6 rounded-3xl bg-black/30 px-4 py-3"
                      >
                        <div className="relative h-40 w-56 shrink-0">
                          <Image
                            src={promo.promotion.image}
                            alt={promo.promotion.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />
                        </div>

                        <div className="text-center">
                          <p className="text-3xl font-black line-through opacity-75">
                            {promo.full_price}
                          </p>

                          <p className="text-7xl font-black leading-none text-yellow-300 drop-shadow-xl">
                            {promo.promo_price}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              <div className="grid flex-1 grid-cols-[1fr_360px] gap-8 overflow-hidden">
                <section className="grid grid-cols-4 content-center gap-x-7 gap-y-6">
                  {mainProducts.map((product: Product) => (
                    <article
                      key={product.id}
                      className="text-center"
                    >
                      <div className="relative mx-auto h-36 w-full">
                        <Image
                          src={product.image}
                          alt={getDisplayName(product)}
                          fill
                          className="object-contain drop-shadow-2xl"
                        />
                      </div>

                      <h2 className="mt-1 text-[1.8rem] font-black uppercase leading-none tracking-wide drop-shadow-lg">
                        {getDisplayName(product)}
                      </h2>

                      <p className="mt-1 text-5xl font-black leading-none drop-shadow-lg">
                        {product.price}
                      </p>
                    </article>
                  ))}
                </section>

                {sideProducts.length > 0 && (
                  <aside className="rounded-[2rem] border-4 border-white/50 bg-black/30 px-5 py-5">
                    <p className="mb-4 text-center text-4xl font-black uppercase text-yellow-300 drop-shadow-xl">
                      Fritti / Dessert
                    </p>

                    <div className="flex flex-col gap-4">
                      {sideProducts.map((product: Product) => (
                        <article
                          key={product.id}
                          className="flex items-center gap-4"
                        >
                          <div className="relative h-24 w-24 shrink-0">
                            <Image
                              src={product.image}
                              alt={getDisplayName(product)}
                              fill
                              className="object-contain drop-shadow-xl"
                            />
                          </div>

                          <div>
                            <p className="text-2xl font-black uppercase leading-none">
                              {getDisplayName(product)}
                            </p>

                            {product.subtitle && (
                              <p className="text-xl font-black uppercase leading-none text-yellow-300">
                                {product.subtitle}
                              </p>
                            )}

                            <p className="mt-1 text-4xl font-black leading-none">
                              {product.price}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </aside>
                )}
              </div>

              <footer className="mt-4 border-t-4 border-white/50 pt-3">
                <div className="relative mx-auto h-28 w-full">
                  <Image
                    src="/menu-combo-footer.jpg"
                    alt="Menu combo"
                    fill
                    className="object-contain drop-shadow-2xl"
                  />
                </div>
              </footer>
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
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
        </div>
      </section>
    </main>
  );
}