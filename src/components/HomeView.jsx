import React, { useEffect, useRef, useState } from 'react';
import HeroImage from '../assets/Olympus.png';
import DaedalusImage from '../assets/Daedalus Hammer Picture.png';
import IntroVideo from '../assets/Powered By SIGMA Daedalus.mp4';
import OdysseyIcon from '../assets/Icons/Odyssey Path Icon.png';
import AnvilIcon from '../assets/Icons/The Anvil Icon.png';
import ForgeIcon from '../assets/Icons/The Forge Icon.png';
import ColleseumIcon from '../assets/Icons/The Colleseum Icon.png';
import IdeaButton from '../assets/Icons/Idea Button.png';

const homeTiles = [
  {
    id: 'roadmap',
    title: 'The Olympus Path',
    realName: 'Roadmap',
    icon: OdysseyIcon,
    blurb: 'Strategic view of requests, themes, and delivery sequencing.',
  },
  {
    id: 'board',
    title: 'The Anvil',
    realName: 'Kanban Board',
    icon: AnvilIcon,
    blurb: 'Execution board for shaping ideas into working outcomes.',
  },
  {
    id: 'forge',
    title: 'The Forge',
    realName: 'Learning & Practice',
    icon: ForgeIcon,
    blurb: 'Bootcamp, Vibe Coding, and progress tracking in one hub.',
  },
  {
    id: 'colleseum',
    title: 'The Colleseum',
    realName: 'Social Arena',
    icon: ColleseumIcon,
    blurb: 'Share ideas, links, and success stories with the team.',
  },
];

export default function HomeView({ onNavigate }) {
  const videoRef = useRef(null);
  const [needsSoundAction, setNeedsSoundAction] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.volume = 0.3;
      video.muted = false;
      video.play().catch(() => {
        // Browser blocked autoplay with sound. Fall back to muted autoplay.
        video.muted = true;
        video.play().catch(() => {
          // Ignore if playback is blocked entirely.
        });
        setNeedsSoundAction(true);
      });

      const onEnded = () => {
        // Keep the last rendered frame visible instead of resetting.
        const endFrameTime = Math.max(0, (video.duration || 0) - 0.05);
        video.currentTime = endFrameTime;
        video.pause();
      };

      video.addEventListener('ended', onEnded);
      return () => {
        video.removeEventListener('ended', onEnded);
      };
    }
  }, []);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = 0.3;
    video.muted = false;
    video.play().then(() => {
      setNeedsSoundAction(false);
    }).catch(() => {
      // If still blocked, keep prompt visible.
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <img src={HeroImage} alt="Olympus" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h2 className="text-3xl font-bold tracking-tight">Olympus</h2>
                <p className="mt-1 text-sm font-semibold text-emerald-200">RevOps Innovation Hub</p>
                <p className="mt-2 max-w-2xl text-sm text-gray-100">
                  Navigate strategy, execution, learning, and social collaboration from a single command center.
                </p>
              </div>
            </div>
            <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Ascend Mt. Olympus</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Choose your path through the hub.</p>
              <div className="mt-4 grid gap-3">
                {homeTiles.map((tile) => (
                  <button
                    key={tile.id}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-4 pr-32 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/40 dark:hover:border-blue-500 dark:hover:bg-gray-700"
                    onClick={() => onNavigate(tile.id)}
                    type="button"
                  >
                    <img src={tile.icon} alt="" className="absolute right-3 top-1/2 h-28 w-28 -translate-y-1/2 rounded-xl object-contain opacity-95 transition group-hover:scale-105" />
                    <div className="text-base font-semibold text-gray-900 dark:text-white">{tile.title}</div>
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-300">({tile.realName})</div>
                    <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">{tile.blurb}</p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onNavigate('new-request')}
                className="group relative mt-4 block w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-4 pr-32 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/40 dark:hover:border-blue-500 dark:hover:bg-gray-700"
              >
                <img
                  src={IdeaButton}
                  alt="Summon An Idea"
                  className="absolute right-3 top-1/2 h-28 w-28 -translate-y-1/2 rounded-xl object-contain opacity-95 transition group-hover:scale-105"
                />
                <div className="text-base font-semibold text-gray-900 dark:text-white">Summon An Idea</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300">(Raise a new request)</div>
                <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-300">If you have an idea for an AI use, get it summoned.</p>
              </button>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="h-full min-h-[180px] w-full rounded-2xl border border-gray-200 bg-black object-cover dark:border-gray-600"
                  autoPlay
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                >
                  <source src={IntroVideo} type="video/mp4" />
                </video>
                {needsSoundAction && (
                  <button
                    type="button"
                    onClick={enableSound}
                    className="absolute bottom-3 right-3 rounded-lg bg-black/75 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/85"
                  >
                    Enable sound
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <img src={DaedalusImage} alt="Daedalus" className="h-full min-h-[212px] w-full object-cover" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
