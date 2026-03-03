"use client";

import { useState } from "react";
import { FAQ_ITEMS } from "../content";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="space-y-8 border-t border-white/10 py-16">
      <div className="max-w-3xl">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">FAQ</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Questions teams ask before adopting Zuro.
        </h2>
      </div>

      <div className="space-y-3">
        {FAQ_ITEMS.map((item, index) => {
          const open = openIndex === index;

          return (
            <div key={item.question} className="rounded-xl border border-white/10 bg-zinc-900/60">
              <button
                onClick={() => setOpenIndex(open ? -1 : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-medium text-zinc-100 sm:text-base">{item.question}</span>
                <span className="ml-4 text-zinc-400">{open ? "−" : "+"}</span>
              </button>

              {open && <p className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-zinc-400">{item.answer}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
