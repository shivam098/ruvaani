import Image from "next/image";
import Link from "next/link";

export function BrandLogo() {
  return <Link href="/" className="brand-logo" aria-label="RUVAANI home">
    <Image src="/brand/monogram.webp" alt="" width={574} height={524} className="brand-monogram" />
    <Image src="/brand/wordmark.webp" alt="RUVAANI" width={922} height={210} className="brand-wordmark" />
  </Link>;
}
