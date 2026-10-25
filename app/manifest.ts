import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Massa Diária — Calorias e progresso",
    short_name: "Massa Diária",
    description: "Diário pessoal para completar metas de calorias e proteína e acompanhar o ganho de massa.",
    start_url: "/#hoje",
    display: "standalone",
    background_color: "#f5f7f2",
    theme_color: "#102a43",
    lang: "pt-BR",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/maskable-icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
