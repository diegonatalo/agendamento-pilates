import Image from "next/image";
import { PHOTOS, type PhotoKey } from "@/lib/landing-photos";

type Props = {
  name: PhotoKey;
  sizes: string;
  /** Só para o que aparece na primeira tela. */
  eager?: boolean;
  /** Foto repetida, só de enfeite: fica fora do leitor de tela. */
  decorative?: boolean;
};

/** Preenche o elemento pai, que precisa ser `relative`. */
export const Photo = ({ name, sizes, eager = false, decorative = false }: Props) => {
  const photo = PHOTOS[name];
  return (
    <Image
      src={photo.src}
      alt={decorative ? "" : photo.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      className="object-cover"
      style={{ objectPosition: photo.focus }}
    />
  );
};
