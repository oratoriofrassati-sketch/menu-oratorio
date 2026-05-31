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

  const fastFoodOpen = settings?.fast_food_open ?? true;
  const menuDate = formatMenuDate(settings?.menu_date);

  const activeIds =
    activeMenu?.map((item) => item.product_id) || [];

  const activeProducts =
    products?.filter((product: Product) =>
      activeIds.includes(product.id)
    ) || [];

  const comboProducts = activeProducts.filter(
    (product: Product) =>
      product.id.startsWith("combo-")
  );

  const frittiDessertProducts = activeProducts.filter(
    (product: Product) =>
      product.id === "patatine" ||
      product.id === "nuggets-pollo" ||
      product.id === "frutta" ||
      product.id === "dolce"
  );

  const mainProducts = activeProducts.filter(
    (product: Product) =>
      !product.id.startsWith("combo-") &&
      product.id !== "patatine" &&
      product.id !== "nuggets-pollo" &&
      product.id !== "frutta" &&
      product.id !== "dolce"
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

        <div className="relative z-10 h-full px-10 py-6 font-[family-name:var(--font-caveat)]">
          {fastFoodOpen ? (
            <div className="flex h-full flex-col">
              <header className="mb-2 flex items-center justify-between">
                <div className="relative h-36 w-72">
                  <Image
                    src="/fast-food-logo.png"
                    alt="Frassati Fast Food"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <div className="text-right drop-shadow-xl">
                  <p className="text-5xl font-black uppercase">
                    Menu di
                  </p>

                  <p className="mt-1 text-4xl font-black uppercase">
                    {menuDate}
                  </p>
                </div>
              </header>

              <div className="grid flex-1 grid-cols-4 gap-x-6 gap-y-2">
                {mainProducts.map((product: Product) => (
                  <article
                    key={product.id}
                    className="text-center"
                  >
                    <div className="relative mx-auto h-40 w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <h2 className="mt-1 text-[2rem] font-black uppercase leading-none tracking-wide drop-shadow-lg">
                      {product.name}
                    </h2>

                    <p className="mt-1 text-5xl font-black drop-shadow-lg">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>

              {frittiDessertProducts.length > 0 && (
                <div className="mt-2 flex items-center justify-center gap-10">
                  {frittiDessertProducts.map((product: Product) => (
                    <article
                      key={product.id}
                      className="flex items-center gap-3"
                    >
                      <div className="relative h-20 w-20">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain drop-shadow-xl"
                        />
                      </div>

                      <div>
                        <p className="text-2xl font-black uppercase leading-none">
                          {product.name}
                        </p>

                        <p className="text-3xl font-black">
                          {product.price}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {comboProducts.length > 0 && (
                <div className="mt-4 rounded-[2rem] border-4 border-yellow-300/70 bg-black/35 px-8 py-4">
                  <div className="grid grid-cols-2 gap-10">
                    {comboProducts.map((product: Product) => (
                      <article
                        key={product.id}
                        className="flex items-center gap-6"
                      >
                        <div className="relative h-52 w-72 shrink-0">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />
                        </div>

                        <div>
                          <p className="text-6xl font-black uppercase leading-none drop-shadow-xl">
                            Menu Combo
                          </p>

                          <p className="mt-4 text-7xl font-black text-yellow-300 drop-shadow-xl">
                            {product.price}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
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