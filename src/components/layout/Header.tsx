"use client";

import { withBasePath } from "@/lib/base-path";
import Image from "next/image";

import { SiteIdentity, splitSiteName } from "@/config/site";

export function Header() {
  const wordmark = splitSiteName();
  return (
    <header className="p3-landing-hero w-full font-sans">
      <div className="p3-header-strip p3-content-shell">
        <div className="p3-header-left min-w-0 gap-5 sm:gap-7 md:gap-9 lg:gap-10">
          <div className="p3-header-emblem shrink-0">
            <Image
              src={withBasePath("/visuals/icon.png")}
              alt={`${SiteIdentity.name} mark`}
              width={96}
              height={96}
              priority
              className="p3-header-logo object-contain"
            />
          </div>

          <div className="p3-header-brand">
            <h1 className="p3-brand-wordmark">
              <span className="p3-brand-title-main">{wordmark.main}</span>
              {wordmark.sub && <span className="p3-brand-title-sub">{wordmark.sub}</span>}
            </h1>
            <p className="p3-brand-tagline">{SiteIdentity.tagline}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
