import Image from "next/image";

import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
    products?.filter((product) =>
      activeIds.includes(product.id)
    ) || [];

  return (
    <main className="min-h-screen bg-blue-900 text-white p-8">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-6xl font-black mb-10">
          FRASSATI FAST FOOD
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {activeProducts.map((product) => (
            <div
              key={product.id}
              className="bg-blue-800 rounded-3xl p-6 text-center"
            >
              <div className="relative w-full h-40 mb-5">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>

              <h2 className="text-2xl font-bold mb-4">
                {product.name}
              </h2>

              <p className="text-3xl font-black">
                {product.price}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}