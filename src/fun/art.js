// Myia's illustrations from her Planetary Responsibility slides.
import gift1 from "@/assets/art/gift-1.jpg";
import gift2 from "@/assets/art/gift-2.jpg";
import gift3 from "@/assets/art/gift-3.jpg";
import gift4 from "@/assets/art/gift-4.jpg";
import gift5 from "@/assets/art/gift-5.jpg";
import bgTitle from "@/assets/art/bg-title.jpg";

export const GIFT_ART = { 1: gift1, 2: gift2, 3: gift3, 4: gift4, 5: gift5 };

// Where the heroine's face is in each picture (used to crop round portraits).
export const ART_FOCUS = { 1: "40% 26%", 2: "63% 24%", 3: "48% 30%", 4: "42% 38%", 5: "29% 18%" };

// One-line picture captions, written for the comic panels.
export const ART_CAPTION = {
  1: "She pulls back the curtain and shines a light on the crack nobody wanted to talk about.",
  2: "She breaks through the wall and faces the dark knight of “that's just how it's done.”",
  3: "She grabs the mic and says what the whole room was feeling.",
  4: "She lights one candle, and that candle lights the next. Courage spreads.",
  5: "In the storm, she holds a hand and walks toward the lighthouse together.",
};

export { bgTitle };
