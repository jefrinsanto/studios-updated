import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Smartphone, Bot, Palette, Mail, ArrowRight, Copy, Check } from "lucide-react";

const TRACKS = [
  { icon: Code2, label: "Web & Software", note: "Ship real features on real projects, not busywork." },
  { icon: Smartphone, label: "Mobile", note: "Build and test on actual iOS/Android builds." },
  { icon: Bot, label: "AI & Automation", note: "Work on workflow and automation tooling." },
  { icon: Palette, label: "Design", note: "UI/UX on live product and brand work." },
];

export default function Internships() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("innovexastudios2026@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail (older browsers, blocked permissions) — the
      // "Email directly" button next to this still works as the primary path.
    }
  };

  return (
    <section id="internships" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-eyebrow">Internships</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
              Learn by building things that ship.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
              INNOVEXA STUDIOS takes on interns to work directly alongside the
              people building the product — real project work, real code
              review, real deadlines. Not fetch-coffee busywork.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#connect" className="btn-primary">
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=innovexastudios2026@gmail.com&su=Internship%20Application%20%E2%80%94%20INNOVEXA%20STUDIOS"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <Mail className="h-4 w-4" />
                Email directly
              </a>
              <button
                type="button"
                onClick={handleCopy}
                aria-label="Copy email address"
                className="flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors duration-200 hover:text-white/70"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy address instead
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Tracks */}
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/[0.06] sm:grid-cols-2">
            {TRACKS.map((track, i) => {
              const Icon = track.icon;
              return (
                <motion.div
                  key={track.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: (i % 2) * 0.1 }}
                  className="bg-white/[0.02] px-7 py-9 transition-colors duration-300 hover:bg-white/[0.04]"
                >
                  <Icon className="h-6 w-6 text-electric" strokeWidth={1.5} />
                  <h3 className="mt-5 font-display text-base font-semibold text-white">
                    {track.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {track.note}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
