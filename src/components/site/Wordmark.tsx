import Link from "next/link";
import Image from "next/image";

export function Wordmark({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center">
      <Image
        src={light ? "/images/Wild-Coast-Costa-Rica-logo-header.png" : "/images/Wild-Coast-Costa-Rica-logo-header-orange.png"}
        alt="Wild Coast"
        width={160}
        height={40}
        priority
        className="h-10 w-auto transition-opacity duration-200 group-hover:opacity-80"
      />
    </Link>
  );
}
