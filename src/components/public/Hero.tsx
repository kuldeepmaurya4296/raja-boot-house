"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import heroImg from "@/assets/hero-boots.jpg";
import slide2Img from "@/assets/product-1.jpg";
import slide3Img from "@/assets/product-4.jpg";

export function Hero() {
  const [banners, setBanners] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);

  // Fetch banners
  useEffect(() => {
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data);
        } else {
          setBanners(getFallbackBanners());
        }
      })
      .catch(() => {
        setBanners(getFallbackBanners());
      });
  }, []);

  // Autoplay timer
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  const getFallbackBanners = () => [
    {
      id: "b1",
      title: "Boots made the old way.",
      subtitle: "Fifty years of cobbler-grade craft. Hand-cut leather, Goodyear-welted soles, and a fit that softens into you.",
      cta: "Shop the collection",
      href: "/shop",
      tagline: "Spring · Summer 2026",
      badgeTitle: "Raja Oxblood Chelsea",
      badgePrice: "From ₹1,299",
      image: heroImg.src,
      objectPosition: "object-[20%_center]",
    },
    {
      id: "b2",
      title: "Bridal & Dulha Heritage",
      subtitle: "Handcrafted wedding sets, groom mojaris, and bride heels tailored to add royal charm to your functions.",
      cta: "Explore Wedding collection",
      href: "/shop?category=bridal",
      tagline: "Dulha-Dulhan Special",
      badgeTitle: "Embroidered Dulha Joota",
      badgePrice: "From ₹2,799",
      image: slide2Img.src,
      objectPosition: "object-center",
    },
    {
      id: "b3",
      title: "Reputed National Brands",
      subtitle: "Guaranteed comfort and longevity. Official retailers for Lakhani, Touch, Paragon, Goldstar, and more.",
      cta: "Shop Top Brands",
      href: "/shop",
      tagline: "Gupta Brothers Curations",
      badgeTitle: "Lakhani Classic Runner",
      badgePrice: "From ₹899",
      image: slide3Img.src,
      objectPosition: "object-center",
    },
  ];

  if (banners.length === 0) {
    return (
      <div className="h-[500px] w-full bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Assign image fallbacks for dynamic banners that might not specify images
  const slides = banners.map((b, idx) => {
    let img = b.image;
    if (!img) {
      if (idx === 0) img = heroImg.src;
      else if (idx === 1) img = slide2Img.src;
      else img = slide3Img.src;
    }
    return {
      ...b,
      image: img,
      tagline: b.tagline || "Raja Boot House · Established 2025",
      badgeTitle: b.badgeTitle || "Premium Quality",
      badgePrice: b.badgePrice || "Best Price Assured",
      objectPosition: b.objectPosition || (idx === 0 ? "object-[20%_center]" : "object-center"),
    };
  });

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[current];

  return (
    <section className="relative overflow-hidden bg-cream border-b border-border min-h-[500px] md:min-h-[580px] flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          
          {/* Slide Content Column */}
          <div className="relative h-[280px] md:h-[380px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5 }}
                className="space-y-5 md:space-y-6 text-left"
              >
                <span className="inline-block text-[10px] tracking-[0.3em] uppercase text-cognac font-bold border border-cognac/30 rounded-full px-3 py-1 bg-cream">
                  {active.tagline}
                </span>
                
                <h1 className="font-serif text-[38px] leading-[1.05] md:text-6xl md:leading-[0.98] font-bold text-charcoal text-balance">
                  {active.title}
                </h1>
                
                <p className="text-sm md:text-base text-muted-foreground max-w-md">
                  {active.subtitle}
                </p>
                
                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={active.href}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 rounded-full text-xs md:text-sm font-semibold hover:bg-primary/90 transition group cursor-pointer"
                  >
                    {active.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Image Column */}
          <div className="relative max-w-[272px] md:max-w-[352px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6 }}
                className="relative w-full"
              >
                <div className="relative aspect-[4/5] max-h-[340px] md:max-h-[440px] rounded-2xl overflow-hidden shadow-elevated border border-border">
                  <img
                    src={active.image}
                    alt="Raja Boot House"
                    className={`h-full w-full object-cover ${active.objectPosition} transition duration-700`}
                  />
                  {/* Subtle vignette layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Floating Spec Badge */}
                <div className="absolute -bottom-4 -left-4 md:bottom-6 md:left-6 bg-cream/95 backdrop-blur-sm border border-border rounded-xl shadow-card px-4 py-3 max-w-[220px]">
                  <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Featured Style</div>
                  <div className="font-serif font-bold text-xs md:text-sm mt-1 text-charcoal truncate">
                    {active.badgeTitle}
                  </div>
                  <div className="text-[11px] text-primary font-bold mt-1">
                    {active.badgePrice}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Navigation arrows (desktop only) */}
      {slides.length > 1 && (
        <div className="hidden md:flex absolute bottom-8 right-8 gap-2 z-10">
          <button
            onClick={prevSlide}
            className="h-10 w-10 border border-border bg-cream hover:bg-muted text-charcoal rounded-full grid place-items-center transition cursor-pointer"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={nextSlide}
            className="h-10 w-10 border border-border bg-cream hover:bg-muted text-charcoal rounded-full grid place-items-center transition cursor-pointer"
            aria-label="Next banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Navigation Indicators dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === i ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
