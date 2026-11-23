import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-primary/15 px-4 py-7 text-center">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Designed &amp; built by Myia Mack
        <span aria-hidden className="px-1.5 text-primary/70">·</span>
        i.c.stars
        <span aria-hidden className="px-1.5 text-primary/70">·</span>
        Made with help from AI tools (Claude, Base44)
      </p>
      <Link
        to="/admin"
        className="mt-3 inline-block text-[11px] text-muted-foreground/60 underline-offset-4 transition-colors hover:text-primary hover:underline"
      >
        Edit content
      </Link>
    </footer>
  );
}