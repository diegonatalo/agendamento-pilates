import { Fragment } from "react";
import { SECTION } from "@/components/landing/styles";
import { cn } from "@/lib/cn";
import { PHOTOS } from "@/lib/landing-photos";

/** Um crédito por autor, com link para a primeira foto dele. */
const AUTHORS = [...new Map(Object.values(PHOTOS).map((photo) => [photo.author, photo.source]))];

export const PhotoCredits = () => (
  <p className={cn(SECTION, "pb-8 text-center text-xs leading-6 text-muted")}>
    Fotos ilustrativas do Unsplash, de{" "}
    {AUTHORS.map(([author, source], index) => (
      <Fragment key={author}>
        {index === 0 ? "" : index === AUTHORS.length - 1 ? " e " : ", "}
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded underline underline-offset-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-primary"
        >
          {author}
        </a>
      </Fragment>
    ))}
    . As pessoas retratadas não são clientes do Encaixe.
  </p>
);
