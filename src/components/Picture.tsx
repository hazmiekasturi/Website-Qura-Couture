import manifest from "@/lib/images.json";

export type ImageName = keyof typeof manifest;

type Props = {
  name: ImageName;
  alt: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  draggable?: boolean;
};

const info = (name: ImageName) => manifest[name] as { w: number; h: number; widths: number[]; alpha: boolean; blur: string | null };

export function srcSet(name: ImageName, ext: "avif" | "webp") {
  return info(name)
    .widths.map((w) => `/img/${name}-${w}.${ext} ${w}w`)
    .join(", ");
}

export function largest(name: ImageName, ext: "avif" | "webp" = "webp") {
  const i = info(name);
  return `/img/${name}-${i.widths[i.widths.length - 1]}.${ext}`;
}

export function aspect(name: ImageName) {
  const i = info(name);
  return i.w / i.h;
}

/** Responsive <picture> with AVIF + WebP sources from the image pipeline. */
export function Picture({ name, alt, sizes = "100vw", className, priority, style, draggable }: Props) {
  const i = info(name);
  const mid = i.widths.find((w) => w >= 768) ?? i.widths[i.widths.length - 1];
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet(name, "avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(name, "webp")} sizes={sizes} />
      <img
        src={`/img/${name}-${mid}.webp`}
        alt={alt}
        width={i.w}
        height={i.h}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        draggable={draggable}
        style={i.blur ? { backgroundImage: `url(${i.blur})`, backgroundSize: "cover", ...style } : style}
      />
    </picture>
  );
}
