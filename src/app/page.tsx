import Image from "next/image";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export default async function HomePage() {
  const { data: products } = await supabase
    .from("products")
    .select("*");

  const { data: activeMenu } = await supabase
    .from("active_menu")
    .select("*");

  const activeIds =
    activeMenu?.map((item) => item.product_id) || [];

  const activeProducts =
    products?.filter((product: Product) =>
      activeIds.includes(product.id)
    ) || [];

  return (
    <main className="min-h-screen bg-[#133f8c] text-white px-4 py-6">
      <section className="mx-auto max-w-[430px] overflow-hidden rounded-[2rem] bg-[#12377a] shadow-2xl border-4 border-yellow-300">
        <div className="bg-yellow-300 text-[#12377a] px-6 py-5 text-center">
          <p className="text-sm font-black tracking-[0.35em] uppercase">
            Oratorio Frassati
          </p>

          <h1 className="text-5xl font-black leading-none mt-2">
            FAST
            <br />
            FOOD
          </h1>

          <p className="mt-3 text-lg font-black">
            Menù della serata
          </p>
        </div>

        <div className="px-5 py-6 space-y-5">
          {activeProducts.map((product: Product) => (
            <div
              key={product.id}
              className="relative flex items-center gap-4 rounded-3xl bg-white text-[#12377a] p-4 shadow-xl"
            >
              <div className="relative h-24 w-28 shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain drop-shadow-xl"
                />
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-black leading-tight">
                  {product.name}
                </h2>
              </div>

              <div className="rounded-2xl bg-red-600 px-3 py-2 text-white font-black text-xl shadow-lg">
                {product.price}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-300 text-[#12377a] text-center px-6 py-4">
          <p className="font-black text-lg">
            Vi aspettiamo in oratorio!
          </p>
        </div>
      </section>
    </main>
  );
}