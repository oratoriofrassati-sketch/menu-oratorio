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

  const activeIds =
    activeMenu?.map((item) => item.product_id) || [];

  const activeProducts =
    products?.filter((product: Product) =>
      activeIds.includes(product.id)
    ) || [];

  const today = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Rome",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <section
        className="relative aspect-video w-full max-w-[1920px] overflow-hidden text-white"
        style={{
          backgroundImage: "url('/menu-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-blue-950/20" />

        <div className="relative z-10 h-full px-16 py-10 font-[family-name:var(--font-caveat)]">
          <div className="grid h-full grid-cols-[380px_1fr] gap-14">
            <div className="flex flex-col justify-between">
              <div>
                <div className="relative h-72 w-full">
                  <Image
                    src="/fast-food-logo.png"
                    alt="Frassati Fast Food"
                    fill
                    priority
                    className="object-contain drop-shadow-2xl"
                  />
                </div>

                <div className="mt-8 text-center drop-shadow-xl">
                  <p className="text-5xl font-black uppercase">
                    Menu di oggi
                  </p>

                  <p className="mt-3 text-4xl font-black uppercase">
                    {today}
                  </p>
                </div>
              </div>

              <p className="text-center text-4xl font-black drop-shadow-xl">
                Oratorio Frassati
              </p>
            </div>

            {fastFoodOpen ? (
              <div className="grid grid-cols-3 gap-x-10 gap-y-8 content-center">
                {activeProducts.map((product: Product) => (
                  <article
                    key={product.id}
                    className="text-center"
                  >
                    <div className="relative mx-auto mb-2 h-36 w-full">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain drop-shadow-2xl"
                      />
                    </div>

                    <h2 className="text-[2.15rem] font-black uppercase leading-none tracking-wide drop-shadow-lg">
                      {product.name}
                    </h2>

                    <p className="mt-2 text-5xl font-black drop-shadow-lg">
                      {product.price}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center">
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
        </div>
      </section>
    </main>
  );
}