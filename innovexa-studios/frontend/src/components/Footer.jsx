import { motion } from "framer-motion";
import { Mail, Instagram } from "lucide-react";

const QUICK_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Services", href: "#services" },
  { label: "Solutions", href: "#solutions" },
  { label: "Process", href: "#process" },
  { label: "Internships", href: "#internships" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#connect" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#0B0D17]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-6 py-14 lg:px-8"
      >
        <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-3 sm:text-left">
          {/* Brand */}
          <div>
            <a href="#home" className="flex items-center justify-center gap-2.5 sm:justify-start">
              <img src="/logo-icon.png" alt="INNOVEXA STUDIOS" className="h-8 w-8 object-contain" />
              <span className="font-display text-base font-bold text-white">
                INNOVEXA <span className="text-white/50 font-normal">STUDIOS</span>
              </span>
            </a>
            <p className="mx-auto mt-4 max-w-xs text-sm sm:mx-0 leading-relaxed text-white/45">
              Software. Products. Experiences.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-display text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-center gap-2.5 text-sm text-white/50 sm:justify-start">
                <Mail className="h-4 w-4 shrink-0 text-electric" />
                <a href="mailto:innovexastudios2026@gmail.com" className="transition-colors hover:text-white">
                  innovexastudios2026@gmail.com
                </a>
              </li>
              <li className="flex items-center justify-center gap-2.5 text-sm text-white/50 sm:justify-start">
                <a
                  href="https://www.instagram.com/innovexa_studios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="INNOVEXA STUDIOS on Instagram"
                  className="flex items-center justify-center gap-2.5 transition-colors hover:text-white sm:justify-start"
                >
                  <Instagram className="h-4 w-4 shrink-0 text-electric" />
                  @innovexa_studios
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
          <p className="text-xs text-white/45">
            © {new Date().getFullYear()} INNOVEXA STUDIOS. All rights reserved.
          </p>
          <p className="text-xs text-white/45">Built with React, Node.js & MongoDB</p>
        </div>
      </motion.div>
    </footer>
  );
}
