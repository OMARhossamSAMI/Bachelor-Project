import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Learn German Food Culture",
  description:
    "Discover German culture through stories, food, and experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Meta + Favicons */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="assets/img/DeutschFlag_Curvy.png" rel="icon" />
        <link href="/assets/img/apple-touch-icon.png" rel="apple-touch-icon" />

        {/* Google Fonts */}
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link
          href="https://fonts.gstatic.com"
          rel="preconnect"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100;300;400;500;700;900&family=Poppins:wght@100;200;300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@200;300;400;600;700;900&display=swap"
          rel="stylesheet"
        />

        {/* Vendor CSS Files */}
        <link
          href="/assets/vendor/bootstrap/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link
          href="/assets/vendor/bootstrap-icons/bootstrap-icons.css"
          rel="stylesheet"
        />
        <link href="/assets/vendor/aos/aos.css" rel="stylesheet" />
        <link
          href="/assets/vendor/glightbox/css/glightbox.min.css"
          rel="stylesheet"
        />
        <link
          href="/assets/vendor/swiper/swiper-bundle.min.css"
          rel="stylesheet"
        />
        {/* Main CSS */}
        <link href="/assets/css/main.css" rel="stylesheet" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}

        {/* Vendor JS Files — correct order */}
        <Script
          src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/assets/vendor/isotope-layout/isotope.pkgd.min.js"
          strategy="beforeInteractive"
        />
        <Script src="/assets/vendor/aos/aos.js" strategy="beforeInteractive" />
        <Script
          src="/assets/vendor/glightbox/js/glightbox.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/assets/vendor/swiper/swiper-bundle.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="/assets/vendor/php-email-form/validate.js"
          strategy="beforeInteractive"
        />

        {/* Initialization script */}
        <Script id="main-init" strategy="afterInteractive">
          {`
            if (window.AOS) AOS.init({ duration: 1000, once: true });
            if (window.GLightbox) GLightbox({ selector: '.glightbox' });
            if (window.Swiper) new Swiper('.init-swiper', { loop: true, autoplay: { delay: 5000 } });

            if (window.Isotope && window.imagesLoaded) {
              const container = document.querySelector('.isotope-container');
              if (container) {
                const iso = new Isotope(container, { itemSelector: '.isotope-item', layoutMode: 'masonry' });
                imagesLoaded(container, () => iso.layout());
                const filters = document.querySelectorAll('.portfolio-filters li');
                filters.forEach(f =>
                  f.addEventListener('click', function () {
                    filters.forEach(el => el.classList.remove('filter-active'));
                    this.classList.add('filter-active');
                    iso.arrange({ filter: this.getAttribute('data-filter') });
                  })
                );
              }
            }
          `}
        </Script>
        {/* Load main.js last */}
        <Script src="/assets/js/main.js" strategy="afterInteractive" />

        {/* Preloader */}
        <div id="preloader"></div>
      </body>
    </html>
  );
}
