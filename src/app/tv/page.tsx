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

  const gridProducts = activeProducts.filter(
    (product: Product) =>
      product.id !== "combo-bibita" &&
      product.id !== "combo-birra"
  );

  return (
    <main className="min-h-screen bg-black flex items-center justify-center overflow-hidden">
      <section className="relative aspect-video w-full max-w-[1920px] overflow-hidden bg-black text-white">
        {fastFoodOpen ? (
          <div className="grid h-full grid-cols-[360px_1fr] gap-3 p-3 font-[family-name:var(--font-caveat)]">
            <aside
              className="flex flex-col overflow-hidden"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="px-4 py-4 text-center drop-shadow-xl">
                <p className="text-4xl font-black uppercase leading-none">
                  {menuDate}
                </p>
              </div>

              <div className="flex flex-1 flex-col gap-5 px-5">
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

                <article className="mt-auto text-center">
                  <div className="relative mx-auto h-56 w-full">
                    <Image
                      src="/menu-combo-footer.jpg"
                      alt="Menu combo"
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>
                </article>
              </div>

              <div className="mt-4 border-t-4 border-yellow-300 px-4 py-4 text-center">
                <p className="text-xl font-black italic">
                  Menu soggetto a disponibilità
                </p>
              </div>
            </aside>

            <section
              className="grid h-full grid-cols-4 grid-rows-2 gap-x-5 gap-y-3 overflow-hidden px-6 py-5"
              style={{
                backgroundImage: "url('/menu-bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {gridProducts.map((product: Product) => (
                <article
                  key={product.id}
                  className="flex flex-col items-center justify-center text-center"
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={product.image}
                      alt={getDisplayName(product)}
                      fill
                      className="object-contain drop-shadow-2xl"
                    />
                  </div>

                  <h2 className="mt-2 text-[1.65rem] font-black uppercase leading-none tracking-wide drop-shadow-lg">
                    {getDisplayName(product)}
                  </h2>

                  {product.subtitle && (
                    <p className="mt-1 text-[1.35rem] font-black uppercase leading-none text-yellow-300 drop-shadow-lg">
                      {product.subtitle}
                    </p>
                  )}

                  <p className="mt-2 text-4xl font-black leading-none drop-shadow-lg">
                    {product.price}
                  </p>
                </article>
              ))}
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