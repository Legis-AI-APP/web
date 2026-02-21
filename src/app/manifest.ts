import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LEGIS AI",
    short_name: "LEGIS",
    description: "Asistente jurídico inteligente centrado en el caso activo.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b1220",
    theme_color: "#0b1220",
    categories: ["productivity", "business"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Casos",
        short_name: "Casos",
        description: "Abrir lista de casos",
        url: "/cases",
      },
      {
        name: "Clientes",
        short_name: "Clientes",
        description: "Abrir lista de clientes",
        url: "/clients",
      },
      {
        name: "Buscar",
        short_name: "Buscar",
        description: "Buscar casos y clientes",
        url: "/search",
      },
      {
        name: "Redactor",
        short_name: "Redactor",
        description: "Abrir redactor",
        url: "/draft",
      },
    ],
  };
}
