import { useEffect, useState } from "react";

const STORAGE_KEY = "todisrupt.progress.v1";

const EMPTY = {
  mastered: [],
  actions: {},
  answers: {},
  branches: {},
  freePlay: false,
  reduceMotion: false,
};

function read() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export default function useProgress() {
  const [progress, setProgress] = useState(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* storage unavailable */
    }
  }, [progress]);

  const toggleAction = (id) =>
    setProgress((prev) => ({
      ...prev,
      actions: { ...prev.actions, [id]: !prev.actions[id] },
    }));

  const masterGift = (number) =>
    setProgress((prev) =>
      prev.mastered.includes(number)
        ? prev
        : { ...prev, mastered: [...prev.mastered, number].sort((a, b) => a - b) }
    );

  const setAnswer = (number, value) =>
    setProgress((prev) => ({ ...prev, answers: { ...prev.answers, [number]: value } }));

  const chooseBranch = (giftId, branchId) =>
    setProgress((prev) => ({ ...prev, branches: { ...prev.branches, [giftId]: branchId } }));

  const toggleFreePlay = () => setProgress((prev) => ({ ...prev, freePlay: !prev.freePlay }));

  const toggleReduceMotion = () =>
    setProgress((prev) => ({ ...prev, reduceMotion: !prev.reduceMotion }));

  const reset = () =>
    setProgress((prev) => ({ ...EMPTY, reduceMotion: prev.reduceMotion }));

  return {
    progress,
    toggleAction,
    masterGift,
    setAnswer,
    chooseBranch,
    toggleFreePlay,
    toggleReduceMotion,
    reset,
  };
}