// Read-aloud voice for Myia's Hero (uses the voices installed on this computer/browser).
const KEY = "todisrupt.voice";

export function getVoiceName() {
  try {
    return window.localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setVoiceName(name) {
  try {
    window.localStorage.setItem(KEY, name);
  } catch {
    /* storage unavailable */
  }
}

/** English voices, with the more natural-sounding ones first. */
export function listVoices() {
  const all = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  const en = all.filter((v) => /^en/i.test(v.lang));
  const score = (v) => (/natural|neural|online/i.test(v.name) ? 0 : /google/i.test(v.name) ? 1 : 2);
  return en.sort((a, b) => score(a) - score(b) || a.name.localeCompare(b.name));
}

export function speak(text, voiceName = getVoiceName()) {
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = synth.getVoices().find((x) => x.name === voiceName);
    if (v) {
      u.voice = v;
      u.lang = v.lang;
    }
    u.rate = 0.95;
    synth.speak(u);
  } catch {
    /* speech not available */
  }
}
