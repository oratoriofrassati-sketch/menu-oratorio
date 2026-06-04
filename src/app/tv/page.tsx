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

  const frittiDessertProducts = activeProducts.filter(
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

        <div className="relative z-10 h-full px-8 py-6 font-[family-name:var(--font-caveat)]">
          {fastFoodOpen ? (
            <div className="grid h-full grid-cols-[380px_1fr] gap-8">
              <aside className="flex h-full flex-col">
                <div className="relative mx-auto h-44 w-72">
                  <Image
                    src="/fast-food-logo.png"
                    alt="Frassati Fast Food"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <div className="mt-2 text-center drop-shadow-xl">
                  <p className="text-4xl font-black uppercase">
                    Menu di
                  </p>

                  <p className="mt-1 text-3xl font-black uppercase">
                    {menuDate}
                  </p>
                </div>

                {promotions.length > 0 && (
                  <div className="mt-5 flex-1 rounded-[2rem] border-4 border-yellow-300/80 bg-black/40 px-4 py-5">
                    <p className="mb-4 text-center text-4xl font-black uppercase leading-none text-yellow-300 drop-shadow-xl">
                      La Promozione
                      <br />
                      di oggi
                    </p>

                    <div className="flex flex-col gap-4">
                      {promotions.map((promo) => (
                        <article
                          key={promo.promotion_id}
                          className="rounded-3xl bg-black/30 p-3 text-center"
                        >
                          <div className="relative mx-auto h-36 w-full">
                            <Image
                              src={promo.promotion.image}
                              alt={promo.promotion.name}
                              fill
                              className="object-contain drop-shadow-2xl"
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-center gap-4">
                            <p className="text-2xl font-black line-through opacity-75">
                              {promo.full_price}
                            </p>

                            <p className="text-5xl font-black text-yellow-300 drop-shadow-xl">
                              {promo.promo_price}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              <div className="flex h-full flex-col">
                <div className="grid flex-1 grid-cols-4 gap-x-6 gap-y-3">
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

                      <h2 className="mt-1 text-[1.75rem] font-black uppercase leading-none tracking-wide drop-shadow-lg">
                        {getDisplayName(product)}
                      </h2>

                      <p className="mt-1 text-4xl font-black drop-shadow-lg">
                        {product.price}
                      </p>
                    </article>
                  ))}
                </div>

                {frittiDessertProducts.length > 0 && (
                  <div className="mt-2 border-t-4 border-white/60 pt-3">
                    <div className="grid grid-cols-4 gap-5">
                      {frittiDessertProducts.map((product: Product) => (
                        <article
                          key={product.id}
                          className="flex items-center justify-center gap-3"
                        >
                          <div className="relative h-20 w-20 shrink-0">
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

                            <p className="text-3xl font-black">
                              {product.price}
                            </p>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 border-t-4 border-white/60 pt-3">
                  <div className="relative mx-auto h-32 w-full">
                    <Image
                      src="/menu-combo-footer.jpg"
                      alt="Menu combo"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>
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