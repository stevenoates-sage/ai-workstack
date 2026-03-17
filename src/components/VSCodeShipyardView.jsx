import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { getAllGuideProgressForUser, setGuideProgress } from '../utils/progressStore';
import VSCodeShipyardBadge from '../assets/Icons/VS Code Shipyard Badge.png';

const VSCODE_SHIPYARD_ID = 'prereq-vscode-shipyard';
const PART1_ID = 'prereq-vscode-shipyard-part1';
const PART2_ID = 'prereq-vscode-shipyard-part2';
const PART3_ID = 'prereq-vscode-shipyard-part3';

export default function VSCodeShipyardView({ currentUser, onBack }) {
  const [progress, setProgress] = useState(() => getAllGuideProgressForUser(currentUser));

  useEffect(() => {
    setProgress(getAllGuideProgressForUser(currentUser));
  }, [currentUser]);

  const part1Done = (progress[PART1_ID]?.percent || 0) >= 100;
  const part2Done = (progress[PART2_ID]?.percent || 0) >= 100;
  const part3Done = (progress[PART3_ID]?.percent || 0) >= 100;
  const completed = (progress[VSCODE_SHIPYARD_ID]?.percent || 0) >= 100;

  const canMarkOverallDone = useMemo(() => part1Done && part2Done && part3Done, [part1Done, part2Done, part3Done]);
  const modulePercent = (part1Done ? 34 : 0) + (part2Done ? 33 : 0) + (part3Done ? 33 : 0);

  const markProgress = (id, done) => {
    const next = {
      ...progress,
      [id]: {
        ...(progress[id] || {}),
        percent: done ? 100 : 0,
        completed: done,
        updatedAt: new Date().toISOString(),
      },
    };

    if ((id === PART1_ID || id === PART2_ID || id === PART3_ID) && !done) {
      next[VSCODE_SHIPYARD_ID] = {
        ...(progress[VSCODE_SHIPYARD_ID] || {}),
        percent: 0,
        completed: false,
        updatedAt: new Date().toISOString(),
      };
    }

    setProgress(next);

    setGuideProgress(currentUser, id, {
      percent: done ? 100 : 0,
      completed: done,
    });

    if ((id === PART1_ID || id === PART2_ID || id === PART3_ID) && !done) {
      setGuideProgress(currentUser, VSCODE_SHIPYARD_ID, {
        percent: 0,
        completed: false,
      });
    }
  };

  const markOverall = (done) => {
    const next = {
      ...progress,
      [VSCODE_SHIPYARD_ID]: {
        ...(progress[VSCODE_SHIPYARD_ID] || {}),
        percent: done ? 100 : 0,
        completed: done,
        updatedAt: new Date().toISOString(),
      },
    };

    setProgress(next);

    setGuideProgress(currentUser, VSCODE_SHIPYARD_ID, {
      percent: done ? 100 : 0,
      completed: done,
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <img src={VSCodeShipyardBadge} alt="VS Code Shipyard" className={`h-14 w-14 rounded-xl object-contain ${completed ? '' : 'grayscale opacity-70'}`} />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">VS Code Shipyard</h3>
                <p className="text-xs text-gray-500 dark:text-gray-300">Module checklist</p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-2.5 rounded-full bg-cyan-700" style={{ width: `${modulePercent}%` }} />
            </div>
            <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{modulePercent}% complete</div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Part 1: Install</span>
                {part1Done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Part 2: Configure</span>
                {part2Done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Part 3: Validate</span>
                {part3Done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Shipyard Complete</span>
                {completed ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-start gap-4">
              <img src={VSCodeShipyardBadge} alt="VS Code Shipyard" className={`h-20 w-20 rounded-xl object-contain ${completed ? '' : 'grayscale opacity-60'}`} />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VS Code Shipyard</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  VS Code is Sage's primary development cockpit: lightweight, extension-driven, and ideal for GitHub, Copilot, debugging, and deployment workflows.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-700/40 dark:bg-cyan-900/20">
              <h3 className="text-sm font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-300">Part 1: Install VS Code</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
                <li>Go to the official download page and select the Windows User Installer.</li>
                <li>Run setup with defaults unless your team has a managed standard.</li>
                <li>Enable Add to PATH and optionally the context menu entries.</li>
                <li>Launch VS Code and sign in with your work identity.</li>
                <li>Confirm no startup errors and that the editor opens correctly.</li>
              </ol>
              <a
                href="https://code.visualstudio.com/download"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
              >
                Open VS Code Download
              </a>
              <button
                type="button"
                onClick={() => markProgress(PART1_ID, !part1Done)}
                className={`ml-2 mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${part1Done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-700 hover:bg-cyan-800'}`}
              >
                {part1Done ? 'Part 1 Complete ✓' : 'Mark Part 1 Complete'}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-700/40 dark:bg-indigo-900/20">
              <h3 className="text-sm font-bold uppercase tracking-wide text-indigo-800 dark:text-indigo-300">Part 2: Configure Workspace and Extensions</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
                <li>Open Extensions with Ctrl+Shift+X and install GitHub Pull Requests and Issues.</li>
                <li>Install GitHub Copilot and sign in to GitHub from Accounts.</li>
                <li>Install Prettier and enable Format on Save in settings.</li>
                <li>Set Auto Save and editor defaults to your preferred workflow.</li>
                <li>Open integrated terminal and confirm Git/npm commands work.</li>
              </ol>
              <button
                type="button"
                onClick={() => markProgress(PART2_ID, !part2Done)}
                className={`mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${part2Done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-700 hover:bg-indigo-800'}`}
              >
                {part2Done ? 'Part 2 Complete ✓' : 'Mark Part 2 Complete'}
              </button>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/30">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-800 dark:text-gray-200">Part 3: Validate Your Setup</h3>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
                <li>Open your repository folder and verify files appear in Explorer.</li>
                <li>Check Source Control panel to confirm git status is available.</li>
                <li>Run npm install and npm run dev in terminal without environment errors.</li>
                <li>Open Copilot Chat and verify assistant responses are available.</li>
                <li>Run npm run build successfully to confirm deployment readiness.</li>
              </ol>
              <div className="mt-3 rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800/60 dark:text-gray-200">
                Why this matters: a consistent setup across teams reduces onboarding time, prevents environment drift, and improves handoff speed.
              </div>
              <button
                type="button"
                onClick={() => markProgress(PART3_ID, !part3Done)}
                className={`mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${part3Done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-700 hover:bg-slate-800'}`}
              >
                {part3Done ? 'Part 3 Complete ✓' : 'Mark Part 3 Complete'}
              </button>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!canMarkOverallDone}
                onClick={() => markOverall(!completed)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${completed ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-cyan-700 hover:bg-cyan-800'}`}
              >
                {completed ? 'Shipyard Complete ✓' : 'Mark VS Code Shipyard Complete'}
              </button>
              {!canMarkOverallDone && <span className="text-xs text-gray-600 dark:text-gray-300">Complete Parts 1-3 to unlock final completion.</span>}

              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                Back to The Forge
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
