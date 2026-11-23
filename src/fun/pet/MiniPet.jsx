// React wrapper for Myia's Hero, the draggable mini pet.
import { useEffect, useRef } from "react";
import { makePet } from "./makePet";
import "./pet.css";

const KEY = "todisrupt.pet.v1";
const store = {
  get: () => {
    try {
      return JSON.parse(window.localStorage.getItem(KEY)) || {};
    } catch {
      return {};
    }
  },
  set: (v) => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      /* storage unavailable */
    }
  },
};

/** Mounts the pet once. `petRef.current` gets her controls (narrate, fightHit, ...). */
export default function MiniPet({ petRef, hidden = false }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = document.createElement("div");
    root.className = "mp-root";
    document.body.appendChild(root);
    rootRef.current = root;
    const pet = makePet(root, store);
    petRef.current = pet;
    return () => {
      pet.destroy();
      root.remove();
      petRef.current = null;
    };
  }, [petRef]);

  useEffect(() => {
    petRef.current?.setHidden(hidden);
  }, [hidden, petRef]);

  return null;
}
