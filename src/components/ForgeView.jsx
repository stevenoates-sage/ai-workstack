import React, { useEffect, useState } from 'react';
import { LEARNING_GUIDES } from '../data/learningGuides';
import { getAllGuideProgressForUser, setGuideProgress } from '../utils/progressStore';
import GitHubWingsBadge from '../assets/Icons/GitHub Wings Badge.png';
import SnowflakeWarriorBadge from '../assets/Icons/Snowflake Warrior.png';
import ClaudeGladiatorBadge from '../assets/Icons/Claude Gladiator.png';
import VSCodeShipyardBadge from '../assets/Icons/VS Code Shipyard Badge.png';

const GITHUB_WINGS_ID = 'prereq-github-wings';
const SNOWFLAKE_WARRIOR_ID = 'prereq-snowflake-warrior';
const VSCODE_SHIPYARD_ID = 'prereq-vscode-shipyard';
const VIBE_CODING_ID = 'vibe-coding-track';

const formatDate = (value) => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString();
};

export default function ForgeView({ currentUser, onOpenView }) {
  const [guideProgress, setGuideProgressState] = useState(() => getAllGuideProgressForUser(currentUser));

  useEffect(() => {
    setGuideProgressState(getAllGuideProgressForUser(currentUser));
  }, [currentUser]);

  const bootcampGuide = LEARNING_GUIDES.find((guide) => guide.route === 'bootcamp');

  const githubWingsPercent = guideProgress[GITHUB_WINGS_ID]?.percent || 0;
  const snowflakeWarriorPercent = guideProgress[SNOWFLAKE_WARRIOR_ID]?.percent || 0;
  const vscodeShipyardPercent = guideProgress[VSCODE_SHIPYARD_ID]?.percent || 0;
  const bootcampPercent = bootcampGuide ? guideProgress[bootcampGuide.id]?.percent || 0 : 0;
  const vibeCodingPercent = guideProgress[VIBE_CODING_ID]?.percent || 0;
  const bootcampUnlocked = githubWingsPercent >= 100;

  const githubWingsDate = guideProgress[GITHUB_WINGS_ID]?.updatedAt;
  const snowflakeWarriorDate = guideProgress[SNOWFLAKE_WARRIOR_ID]?.updatedAt;
  const vscodeShipyardDate = guideProgress[VSCODE_SHIPYARD_ID]?.updatedAt;
  const claudeGladiatorDate = bootcampGuide ? guideProgress[bootcampGuide.id]?.updatedAt : null;

  const heroBadges = [
    {
      id: GITHUB_WINGS_ID,
      title: 'GitHub Wings',
      image: GitHubWingsBadge,
      percent: githubWingsPercent,
      updatedAt: githubWingsDate,
    },
    {
      id: SNOWFLAKE_WARRIOR_ID,
      title: 'Snowflake Warrior',
      image: SnowflakeWarriorBadge,
      percent: snowflakeWarriorPercent,
      updatedAt: snowflakeWarriorDate,
    },
    {
      id: VSCODE_SHIPYARD_ID,
      title: 'VS Code Shipyard',
      image: VSCodeShipyardBadge,
      percent: vscodeShipyardPercent,
      updatedAt: vscodeShipyardDate,
    },
    {
      id: 'claude-gladiator',
      title: 'Claude Gladiator',
      image: ClaudeGladiatorBadge,
      percent: bootcampPercent,
      updatedAt: claudeGladiatorDate,
    },
  ];

  const setPrereqStatus = (guideId, completed) => {
    const nextProgress = {
      ...(guideProgress || {}),
      [guideId]: {
        ...(guideProgress?.[guideId] || {}),
        percent: completed ? 100 : 0,
        completed,
        updatedAt: new Date().toISOString(),
      },
    };

    setGuideProgressState(nextProgress);

    setGuideProgress(currentUser, guideId, {
      percent: completed ? 100 : 0,
      completed,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Forge</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">A practice area for guided learning, experimentation, and progress tracking.</p>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-700/50 dark:bg-amber-900/20">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Prerequisites</h3>
            <div className="mt-3 space-y-3">
              <article className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-700/50 dark:bg-gray-800/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Get Your GitHub Wings</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Required before Bootcamp access is enabled.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenView('github-wings')}
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setPrereqStatus(GITHUB_WINGS_ID, githubWingsPercent < 100)}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${githubWingsPercent >= 100 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                    >
                      {githubWingsPercent >= 100 ? 'Completed ✓' : 'Mark complete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-2.5 w-full rounded-full bg-amber-100 dark:bg-amber-900/40">
                  <div className="h-2.5 rounded-full bg-amber-600" style={{ width: `${githubWingsPercent}%` }} />
                </div>
                <div className="mt-1 text-xs font-semibold text-amber-800 dark:text-amber-300">{githubWingsPercent}% complete</div>
              </article>

              <article className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-700/50 dark:bg-gray-800/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">Snowflake Warrior</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Optional prerequisite. Recommended but not required for Bootcamp.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenView('snowflake-warrior')}
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setPrereqStatus(SNOWFLAKE_WARRIOR_ID, snowflakeWarriorPercent < 100)}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${snowflakeWarriorPercent >= 100 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'}`}
                    >
                      {snowflakeWarriorPercent >= 100 ? 'Completed ✓' : 'Mark complete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2.5 rounded-full bg-slate-700" style={{ width: `${snowflakeWarriorPercent}%` }} />
                </div>
                <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{snowflakeWarriorPercent}% complete</div>
              </article>

              <article className="rounded-2xl border border-amber-200 bg-white p-4 dark:border-amber-700/50 dark:bg-gray-800/60">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">VS Code Shipyard</div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Install and configure VS Code for your Sage development workflow.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenView('vscode-shipyard')}
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => setPrereqStatus(VSCODE_SHIPYARD_ID, vscodeShipyardPercent < 100)}
                      type="button"
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${vscodeShipyardPercent >= 100 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-700 hover:bg-cyan-800'}`}
                    >
                      {vscodeShipyardPercent >= 100 ? 'Completed ✓' : 'Mark complete'}
                    </button>
                  </div>
                </div>
                <div className="mt-3 h-2.5 w-full rounded-full bg-cyan-100 dark:bg-cyan-900/40">
                  <div className="h-2.5 rounded-full bg-cyan-700" style={{ width: `${vscodeShipyardPercent}%` }} />
                </div>
                <div className="mt-1 text-xs font-semibold text-cyan-800 dark:text-cyan-300">{vscodeShipyardPercent}% complete</div>
              </article>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Claude Gladiator</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Launch the Claude Gladiator training.</div>
                </div>
                <button
                  onClick={() => onOpenView('bootcamp')}
                  type="button"
                  disabled={!bootcampUnlocked}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {bootcampUnlocked ? 'Open' : 'Locked'}
                </button>
              </div>
              {!bootcampUnlocked && (
                <div className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">Complete Get Your GitHub Wings to unlock Bootcamp.</div>
              )}
              <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${bootcampPercent}%` }} />
              </div>
              <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{bootcampPercent}% complete</div>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">Get Started with Vibe Coding</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Jump into the Vibe Coding workspace.</div>
                </div>
                <button
                  onClick={() => onOpenView('vibe')}
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Open
                </button>
              </div>
              <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${vibeCodingPercent}%` }} />
              </div>
              <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{vibeCodingPercent}% complete</div>
            </article>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hero Progress</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {heroBadges.map((badge) => {
              const achieved = badge.percent >= 100;
              return (
                <article key={badge.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{badge.title}</div>
                  <img
                    src={badge.image}
                    alt={badge.title}
                    className={`mt-3 h-40 w-full rounded-xl object-contain ${achieved ? '' : 'grayscale opacity-50'}`}
                  />
                  <div className="mt-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {achieved ? `Achieved ${formatDate(badge.updatedAt)}` : 'Locked'}
                  </div>
                  <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${badge.percent}%` }} />
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{badge.percent}% complete</div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
