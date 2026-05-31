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

export default async function HomePage() {
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

  const standardProducts = activeProducts.filter(
    (product: Product) =>
      !product.id.startsWith("combo-") &&
      product.id !== "patatine" &&
      product.id !== "nuggets-pollo" &&
      product.id !== "frutta" &&
      product.id !== "dolce"
  );

  return (
    <main className="min-h-screen bg-black flex justify-center">
      <section
        className="relative w-full max-w-[720px] min-h-screen overflow-hidden px-6 py-8 text-white"
        style={{
          backgroundImage: "url('/menu-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-950/20" />

        <div className="relative z-10 font-[family-name:var(--font-caveat)]">
          <div className="relative mx-auto mb-4 h-64 w-full max-w-[360px]">
            <Image
              src="/fast-food-logo.png"
              alt="Frassati Fast Food"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {fastFoodOpen ? (
            <>
              <div className="mb-4 text-center drop-shadow-xl">
                <p className="text-3xl font-black uppercase">
                  Menu di
                </p>

                <p className="text-2xl font-black uppercase mt-2">
                  {menuDate}
                </p>
              </div>

              <div>
                <p className="mb-4 text-center text-3xl font-black uppercase drop-shadow-xl">
                  Panini
                </p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                  {standardProducts.map((product: Product) => (
                    <article
                      key={product.id}
                      className="text-center"
                    >
                      <div className="relative mx-auto mb-0 h-52 w-full">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain drop-shadow-2xl"
                        />
                      </div>

                      <h2 className="text-[1.35rem] font-black uppercase leading-tight tracking-wide drop-shadow-lg">
                        {product.name}
                      </h2>

                      <p className="mt-1 text-2xl font-black drop-shadow-lg">
                        {product.price}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              {frittiProducts.length > 0 && (
                <div className="mt-10">
                  <p className="mb-4 text-center text-3xl font-black uppercase drop-shadow-xl">
                    Fritti
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {frittiProducts.map((product: Product) => (
                      <article
                        key={product.id}
                        className="text-center"
                      >
                        <div className="relative mx-auto mb-0 h-52 w-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />
                        </div>

                        <h2 className="text-[1.35rem] font-black uppercase leading-tight tracking-wide drop-shadow-lg">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-2xl font-black drop-shadow-lg">
                          {product.price}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {dessertProducts.length > 0 && (
                <div className="mt-10">
                  <p className="mb-4 text-center text-3xl font-black uppercase drop-shadow-xl">
                    Dessert
                  </p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                    {dessertProducts.map((product: Product) => (
                      <article
                        key={product.id}
                        className="text-center"
                      >
                        <div className="relative mx-auto mb-0 h-52 w-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />
                        </div>

                        <h2 className="text-[1.35rem] font-black uppercase leading-tight tracking-wide drop-shadow-lg">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-2xl font-black drop-shadow-lg">
                          {product.price}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {comboProducts.length > 0 && (
                <div className="mt-10 border-t-4 border-white/70 pt-8">
                  <p className="mb-6 text-center text-4xl font-black uppercase drop-shadow-xl">
                    Menu Combo
                  </p>

                  <div className="flex flex-col gap-10">
                    {comboProducts.map((product: Product) => (
                      <article
                        key={product.id}
                        className="text-center"
                      >
                        <div className="relative mx-auto mb-2 h-[26rem] w-full">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-contain drop-shadow-2xl"
                          />
                        </div>

                        <p className="mt-0 text-5xl font-black drop-shadow-lg">
                          {product.price}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-16 rounded-[2rem] bg-white/95 px-8 py-12 text-center text-[#12377a] shadow-2xl">
              <p className="text-4xl font-black uppercase leading-tight">
                Questa sera
                <br />
                il Fast Food
                <br />
                è chiuso
              </p>

              <p className="mt-6 text-xl font-bold">
                Vi aspettiamo alla prossima serata!
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}