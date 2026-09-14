import Link from "next/link";
import Image from "next/image";

export function Wordmark({ href = "/", light = false }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="group inline-flex items-center">
      <Image
        src={light ? "/images/Wild-Coast-Costa-Rica-logo-header.svg" : "/images/Wild-Coast-Costa-Rica-logo-header-orange.svg"}
        alt="Wild Coast"
        width={180}
        height={45}
        priority
        className="h-10 w-auto transition-opacity duration-200 group-hover:opacity-80"
      />
    </Link>
  );
}
