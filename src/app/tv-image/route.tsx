import { ImageResponse } from "next/og";
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

type PromotionRow = {
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

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

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

  const promotions = ((activePromotions || []) as PromotionRow[])
    .map((item) => ({
      promotion_id: item.promotion_id,
      full_price: item.full_price,
      promo_price: item.promo_price,
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

  return new ImageResponse(
    (
      <div
        style={{
          width: "1920px",
          height: "1080px",
          display: "flex",
          backgroundColor: "#000000",
          color: "white",
          padding: "12px",
          fontFamily: "Arial Black, Arial, sans-serif",
        }}
      >
        {fastFoodOpen ? (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              gap: "12px",
            }}
          >
            <aside
              style={{
                width: "360px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundImage: `url(${origin}/menu-bg.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                overflow: "hidden",
                padding: "16px 20px",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  fontSize: "38px",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  lineHeight: 1.05,
                  marginBottom: "20px",
                }}
              >
                {menuDate}
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  flex: 1,
                }}
              >
                {promotions.map((promo) => (
                  <div
                    key={promo.promotion_id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={`${origin}${promo.promotion.image}`}
                      alt={promo.promotion.name}
                      style={{
                        width: "100%",
                        height: "210px",
                        objectFit: "contain",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        gap: "14px",
                        marginTop: "8px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: 900,
                          textDecoration: "line-through",
                          opacity: 0.75,
                        }}
                      >
                        {promo.full_price}
                      </div>

                      <div
                        style={{
                          fontSize: "58px",
                          fontWeight: 900,
                          color: "#fde047",
                          lineHeight: 1,
                        }}
                      >
                        {promo.promo_price}
                      </div>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={`${origin}/menu-combo-footer.jpg`}
                    alt="Menu combo"
                    style={{
                      width: "100%",
                      height: "220px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  borderTop: "4px solid #fde047",
                  marginTop: "16px",
                  paddingTop: "12px",
                  textAlign: "center",
                  fontSize: "20px",
                  fontWeight: 900,
                  fontStyle: "italic",
                }}
              >
                Menu soggetto a disponibilità
              </div>
            </aside>

            <section
              style={{
                flex: 1,
                height: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
                gap: "10px",
                backgroundImage: `url(${origin}/menu-bg.jpg)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                padding: "18px 28px",
              }}
            >
              {gridProducts.slice(0, 9).map((product: Product) => (
                <article
                  key={product.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={`${origin}${product.image}`}
                    alt={getDisplayName(product)}
                    style={{
                      width: "100%",
                      height: "170px",
                      objectFit: "contain",
                    }}
                  />

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "34px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      lineHeight: 1,
                    }}
                  >
                    {getDisplayName(product)}
                  </div>

                  {product.subtitle && (
                    <div
                      style={{
                        marginTop: "4px",
                        fontSize: "26px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        color: "#fde047",
                        lineHeight: 1,
                      }}
                    >
                      {product.subtitle}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "52px",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {product.price}
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              backgroundImage: `url(${origin}/menu-bg.jpg)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.95)",
                color: "#12377a",
                borderRadius: "32px",
                padding: "60px 90px",
                textAlign: "center",
                fontWeight: 900,
              }}
            >
              <div
                style={{
                  fontSize: "86px",
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                }}
              >
                Questa sera
                <br />
                il Fast Food
                <br />è chiuso
              </div>

              <div
                style={{
                  marginTop: "36px",
                  fontSize: "42px",
                }}
              >
                Vi aspettiamo alla prossima serata!
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1920,
      height: 1080,
    }
  );
}