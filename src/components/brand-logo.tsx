import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return <Link href="/" className="brand-logo" aria-label="RUVAANI Creations & Packaging home">
    <Image src="/brand/monogram.webp" alt="" width={574} height={524} className="brand-monogram" />
    <span className="brand-lockup">
      <Image src="/brand/ruvaani-wordmark.webp" alt="RUVAANI" width={209} height={43} className="brand-wordmark" />
      <span className="brand-tagline">Creations &amp; Packaging</span>
    </span>
  </Link>;
}
