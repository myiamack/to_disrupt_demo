import React, { useEffect, useMemo, useState } from "react";
import { db } from "@/api/localDb";
import useProgress from "@/hooks/useProgress";
import TopBar from "@/components/game/TopBar";
import Footer from "@/components/game/Footer";
import PresenterBar from "@/components/game/PresenterBar";
import TitleScreen from "@/components/game/screens/TitleScreen";
import OriginScreen from "@/components/game/screens/OriginScreen";
import PowerChainScreen from "@/components/game/screens/PowerChainScreen";
import LevelSelect from "@/components/game/screens/LevelSelect";
import GiftLevel from "@/components/game/screens/GiftLevel";
import DevLogLevel from "@/components/game/screens/DevLogLevel";
import EndingScreen from "@/components/game/screens/EndingScreen";
import { FunProvider, useFun } from "@/fun/FunProvider";
import BattleArena from "@/fun/BattleArena";
import MiniPet from "@/fun/pet/MiniPet";
import HowToPlay from "@/components/game/HowToPlay";

const GUIDE_KEY = "todisrupt.guide.seen";

// Myia's Hero (the mini pet) is the only fighter; the arena stage is not used.
const FIGHTER = "pet";

// Mounts Myia's Hero and has her narrate when the screen changes.
function PetLayer({ screen, giftNumber, chapterStep }) {
  const fun = useFun();
  const stepRef = React.useRef(chapterStep);
  stepRef.current = chapterStep;
  useEffect(() => {
    if (screen === "origin") window.setTimeout(() => fun.petRef.current?.narrate("start"), 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);
  useEffect(() => {
    if (screen === "gift" && chapterStep === 0)
      window.setTimeout(() => {
        if (stepRef.current === 0) fun.petRef.current?.narrate("gift");
      }, 600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, giftNumber, chapterStep]);
  useEffect(() => {
    if (!(screen === "gift" && chapterStep === 4)) fun.endFight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, chapterStep, giftNumber]);
  return <MiniPet petRef={fun.petRef} hidden={screen === "title" || !!fun.stats.petHidden} />;
}

// Gives XP the first time an action is checked or a path is chosen.
function FunBridge({ children }) {
  const fun = useFun();
  return children(fun);
}

export default function Game() {
  const {
    progress,
    toggleAction,
    masterGift,
    chooseBranch,
    toggleFreePlay,
    reset,
  } = useProgress();
  const [screen, setScreen] = useState("title");
  const [giftNumber, setGiftNumber] = useState(1);
  const [chapterStep, setChapterStep] = useState(0);
  const [startStep, setStartStep] = useState({ step: 0, key: 0 });
  const presenter = false; // presenter mode was removed
  const [guideOpen, setGuideOpen] = useState(false);
  const startGame = () => {
    setScreen("origin");
    let seen = false;
    try {
      seen = window.localStorage.getItem(GUIDE_KEY) === "1";
    } catch {
      /* storage unavailable */
    }
    if (!seen) setGuideOpen(true);
  };
  const closeGuide = () => {
    setGuideOpen(false);
    try {
      window.localStorage.setItem(GUIDE_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };
  const [data, setData] = useState({
    gifts: [],
    jobs: [],
    actions: [],
    branches: [],
    devLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [giftPage, jobPage, actionPage, branchPage, logPage] = await Promise.all([
        db.entities.Gift.list({ sort: "number" }),
        db.entities.Job.list({ sort: "created_date" }),
        db.entities.Action.list({ sort: "number" }),
        db.entities.Branch.list({ sort: "number" }),
        db.entities.DevLog.list({ sort: "stage" }),
      ]);
      setData({
        gifts: giftPage.items,
        jobs: jobPage.items,
        actions: actionPage.items,
        branches: branchPage.items,
        devLogs: logPage.items,
      });
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen, giftNumber]);

  const isUnlocked = (number) =>
    progress.freePlay || number === 1 || progress.mastered.includes(number - 1);

  const steps = useMemo(
    () => [
      { screen: "title" },
      { screen: "origin" },
      { screen: "chain" },
      { screen: "select" },
      ...data.gifts.map((gift) => ({ screen: "gift", gift: gift.number })),
      { screen: "devlog" },
      { screen: "ending" },
    ],
    [data.gifts]
  );

  const stepIndex = steps.findIndex(
    (step) => step.screen === screen && (step.gift === undefined || step.gift === giftNumber)
  );

  const goToStep = (index) => {
    const step = steps[index];
    if (!step) return;
    if (step.gift) setGiftNumber(step.gift);
    setScreen(step.screen);
  };

  const pathTrail = useMemo(
    () =>
      data.gifts
        .map((gift) => {
          const chosen = data.branches.find(
            (branch) => branch.id === progress.branches?.[gift.id]
          );
          return chosen
            ? {
                number: gift.number,
                name: gift.name,
                label: chosen.label,
                title: chosen.title,
              }
            : null;
        })
        .filter(Boolean),
    [data.gifts, data.branches, progress.branches]
  );

  const openGift = (gift) => {
    if (!isUnlocked(gift.number)) return;
    setGiftNumber(gift.number);
    setScreen("gift");
  };

  const saveNote = async (stage, learned) => {
    const existing = data.devLogs.find((entry) => entry.stage === stage);
    if (existing) {
      await db.entities.DevLog.update(existing.id, { learned });
      setData((prev) => ({
        ...prev,
        devLogs: prev.devLogs.map((entry) =>
          entry.stage === stage ? { ...entry, learned } : entry
        ),
      }));
    } else {
      const created = await db.entities.DevLog.create({ stage, learned });
      setData((prev) => ({ ...prev, devLogs: [...prev.devLogs, created] }));
    }
  };

  const replay = () => {
    reset();
    setGiftNumber(1);
    setScreen("title");
  };

  const currentGift =
    data.gifts.find((gift) => gift.number === giftNumber) || data.gifts[0];

  const renderScreen = () => {
    switch (screen) {
      case "origin":
        return <OriginScreen onContinue={() => setScreen("chain")} />;
      case "chain":
        return <PowerChainScreen gifts={data.gifts} onContinue={() => setScreen("select")} />;
      case "select":
        return (
          <LevelSelect
            gifts={data.gifts}
            isUnlocked={isUnlocked}
            mastered={progress.mastered}
            freePlay={progress.freePlay}
            onToggleFreePlay={toggleFreePlay}
            onSelectGift={openGift}
            onOpenDevLog={() => setScreen("devlog")}
            onFinish={() => setScreen("ending")}
          />
        );
      case "gift":
        return currentGift ? (
          <FunBridge>
            {(fun) => (
          <GiftLevel
            gift={currentGift}
            gifts={data.gifts}
            allJobs={data.jobs}
            allActions={data.actions}
            jobs={data.jobs.filter((job) => job.gift_id === currentGift.id)}
            actions={data.actions
              .filter((action) => action.gift_id === currentGift.id)
              .sort((a, b) => a.number - b.number)}
            branches={data.branches
              .filter((branch) => branch.gift_id === currentGift.id)
              .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))}
            chosenBranchId={progress.branches?.[currentGift.id]}
            progress={progress}
            presenter={presenter}
            onToggleAction={(id) => {
              if (!progress.actions[id]) fun.award(`action:${id}`, 5);
              toggleAction(id);
            }}
            onChooseBranch={(giftId, branchId) => {
              fun.award(`fork:${giftId}`, 5);
              chooseBranch(giftId, branchId);
            }}
            onMaster={masterGift}
            onBack={() => setScreen("select")}
            hasNext={!!data.gifts.find((gift) => gift.number === giftNumber + 1)}
            onNext={() => setGiftNumber((number) => number + 1)}
            startStep={startStep}
            onStepChange={setChapterStep}
            fighter={FIGHTER}
          />
            )}
          </FunBridge>
        ) : null;
      case "devlog":
        return (
          <DevLogLevel
            devLogs={data.devLogs}
            onSaveNote={saveNote}
            onBack={() => setScreen("select")}
            onFinish={() => setScreen("ending")}
          />
        );
      case "ending":
        return (
          <EndingScreen
            gifts={data.gifts}
            mastered={progress.mastered}
            trail={pathTrail}
            onReplay={replay}
          />
        );
      default:
        return <TitleScreen onStart={startGame} />;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <FunProvider
      reduceMotion={false}
      masteredCount={progress.mastered.length}
      scene={screen === "gift" ? giftNumber : [1, 2, 3, 4, 5].find((n) => !progress.mastered.includes(n)) || 5}
      showArena={screen !== "title"}
      showStage={false}
      fighter={FIGHTER}
    >
      <div className="flex min-h-screen flex-col">
        <TopBar
          masteredCount={progress.mastered.length}
          showProgress
          onHome={() => setScreen("title")}
          onOpenGuide={() => setGuideOpen(true)}
        />

        <BattleArena />
        <PetLayer screen={screen} giftNumber={giftNumber} chapterStep={chapterStep} />
        <HowToPlay open={guideOpen} onClose={closeGuide} gifts={data.gifts} />
        <div className="stage-wrap flex flex-1 flex-col" data-shake>
          {renderScreen()}

          <Footer />
        </div>

        {presenter && screen !== "title" && (
          <PresenterBar
            onBack={() => goToStep(stepIndex - 1)}
            onNext={() => goToStep(stepIndex + 1)}
            canBack={stepIndex > 0}
            canNext={stepIndex >= 0 && stepIndex < steps.length - 1}
            label={`${Math.max(stepIndex + 1, 1)} / ${steps.length}`}
          />
        )}
      </div>
    </FunProvider>
  );
}
