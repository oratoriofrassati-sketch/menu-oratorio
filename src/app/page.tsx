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

        <div className="relative z-10">
          <div className="relative mx-auto mb-12 h-80 w-full max-w-[500px]">
            <Image
              src="/fast-food-logo.png"
              alt="Frassati Fast Food"
              fill
              priority
              className="object-contain drop-shadow-2xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10">
            {activeProducts.map((product: Product) => (
              <article
                key={product.id}
                className="text-center"
              >
                <div className="relative mx-auto mb-3 h-32 w-full">
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

                <p className="mt-2 text-2xl font-black drop-shadow-lg">
                  {product.price}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}