export type PhotoKey = "pilates" | "personal" | "languages" | "music" | "psychology" | "barber";

export type Photo = {
  src: string;
  alt: string;
  /** Ponto que fica visível quando a foto é cortada (`object-position`). */
  focus: string;
  author: string;
  /** Página de origem, onde consta a licença. */
  source: string;
};

/**
 * Fotos gratuitas sob a Licença do Unsplash (https://unsplash.com/license), guardadas em
 * `public/landing/photos/` para nada ser pedido a terceiros por quem visita o site.
 * As pessoas retratadas não são clientes do Encaixe.
 */
export const PHOTOS: Record<PhotoKey, Photo> = {
  pilates: {
    src: "/landing/photos/pilates.webp",
    alt: "Pessoa com os pés nas alças de um reformer, num estúdio de pilates claro.",
    focus: "52% 50%",
    author: "Ahmet Kurt",
    source: "https://unsplash.com/photos/0xn-8kRWOhE",
  },
  personal: {
    src: "/landing/photos/personal.webp",
    alt: "Personal orientando o exercício de uma aluna com halteres.",
    focus: "56% 40%",
    author: "maxhome fitness",
    source: "https://unsplash.com/photos/wSUlQl8HPYc",
  },
  languages: {
    src: "/landing/photos/idiomas.webp",
    alt: "Professora sorrindo ao lado do quadro, de frente para uma aluna.",
    focus: "84% 40%",
    author: "ThisisEngineering",
    source: "https://unsplash.com/photos/h6gCRTCxM7o",
  },
  music: {
    src: "/landing/photos/musica.webp",
    alt: "Professor de música mostrando um acorde no violão para uma aluna.",
    focus: "40% 45%",
    author: "Vitaly Gariev",
    source: "https://unsplash.com/photos/S-vWVfbGr28",
  },
  psychology: {
    src: "/landing/photos/psicologia.webp",
    alt: "Psicóloga conversando com uma paciente, que aparece de costas.",
    focus: "62% 35%",
    author: "Vitaly Gariev",
    source: "https://unsplash.com/photos/RqR2pnTpmHA",
  },
  barber: {
    src: "/landing/photos/barbearia.webp",
    alt: "Barbeiro concentrado, acertando o corte de um cliente.",
    focus: "50% 30%",
    author: "Obi",
    source: "https://unsplash.com/photos/-sRVfY0f2d8",
  },
};
