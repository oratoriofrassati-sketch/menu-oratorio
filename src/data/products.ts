export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export const allProducts: Product[] = [
  {
    id: "panino-salamella",
    name: "Panino con salamella",
    price: "€ 5,00",
    image: "/products/panino-salamella.png",
  },
  {
    id: "rotolo-pollo",
    name: "Rotolo pollo",
    price: "€ 5,00",
    image: "/products/rotolo-pollo.png",
  },
  {
    id: "panino-hot-dog",
    name: "Panino con hot dog",
    price: "€ 3,50",
    image: "/products/panino-hot-dog.png",
  },
  {
    id: "vegetariano",
    name: "Panuozzo vegetariano",
    price: "€ 4,50",
    image: "/products/vegetariano.png",
  },
  {
    id: "patatine",
    name: "Patatine fritte",
    price: "€ 2,50",
    image: "/products/patatine.png",
  },
  {
    id: "salsiccia-friarielli",
    name: "Panuozzo salsiccia e friarielli",
    price: "€ 5,00",
    image: "/products/salsiccia-friarielli.png",
  },
  {
    id: "panino-hamburger",
    name: "Panino con hamburger",
    price: "€ 5,00",
    image: "/products/panino-hamburger.png",
  },
  {
    id: "piadina-cotto-formaggio",
    name: "Piadina cotto e formaggio",
    price: "€ 4,00",
    image: "/products/piadina-cotto-formaggio.png",
  },
  {
    id: "frutta",
    name: "Frutta o dolce",
    price: "€ 2,00",
    image: "/products/frutta.png",
  },
  {
    id: "dolce",
    name: "Dolce",
    price: "€ 2,00",
    image: "/products/dolce.png",
  },
];

export const activeMenuIds = [
  "panino-salamella",
  "patatine",
  "panino-hot-dog",
  "vegetariano",
];