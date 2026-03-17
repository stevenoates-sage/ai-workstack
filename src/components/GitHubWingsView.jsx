import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import GitHubWingsBadge from '../assets/Icons/GitHub Wings Badge.png';
import { getAllGuideProgressForUser, setGuideProgress } from '../utils/progressStore';

const PART1_ID = 'prereq-github-wings-part1';
const PART2_ID = 'prereq-github-wings-part2';
const OVERALL_ID = 'prereq-github-wings';

function CopyCard({ label, value, link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800/60">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">{label}</div>
      <div className="mt-1 break-all text-sm text-gray-800 dark:text-gray-100">{value}</div>
      <div className="mt-3 flex gap-2">
        {link && (
          <a href={link} target="_blank" rel="noreferrer" className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700">
            Open
          </a>
        )}
        <button type="button" onClick={handleCopy} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function GitHubWingsView({ currentUser, onBack, onOpenView }) {
  const [progress, setProgress] = useState(() => getAllGuideProgressForUser(currentUser));

  useEffect(() => {
    setProgress(getAllGuideProgressForUser(currentUser));
  }, [currentUser]);

  const part1Done = (progress[PART1_ID]?.percent || 0) >= 100;
  const part2Done = (progress[PART2_ID]?.percent || 0) >= 100;
  const overallDone = (progress[OVERALL_ID]?.percent || 0) >= 100;
  const moduleProgress = (part1Done ? 50 : 0) + (part2Done ? 50 : 0);

  const canMarkOverallDone = useMemo(() => part1Done && part2Done, [part1Done, part2Done]);

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

    // If either prerequisite part is unchecked, force overall completion off.
    if ((id === PART1_ID || id === PART2_ID) && !done) {
      next[OVERALL_ID] = {
        ...(progress[OVERALL_ID] || {}),
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

    if ((id === PART1_ID || id === PART2_ID) && !done) {
      setGuideProgress(currentUser, OVERALL_ID, {
        percent: 0,
        completed: false,
      });
    }
  };

  const markOverall = (done) => {
    markProgress(OVERALL_ID, done);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <img src={GitHubWingsBadge} alt="GitHub Wings" className={`h-14 w-14 rounded-xl object-contain ${overallDone ? '' : 'grayscale opacity-70'}`} />
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">GitHub Wings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-300">Module checklist</p>
              </div>
            </div>

            <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div className="h-2.5 rounded-full bg-emerald-600" style={{ width: `${moduleProgress}%` }} />
            </div>
            <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{moduleProgress}% complete</div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Part 1</span>
                {part1Done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">Part 2</span>
                {part2Done ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <span className="font-medium text-gray-800 dark:text-gray-100">GitHub Wings</span>
                {overallDone ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Circle size={16} className="text-gray-400" />}
              </div>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-start gap-4">
            <img src={GitHubWingsBadge} alt="GitHub Wings" className={`h-20 w-20 rounded-xl object-contain ${overallDone ? '' : 'grayscale opacity-70'}`} />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get Your GitHub Wings</h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Welcome to GitHub at Sage. This guide covers account setup, Sage enrollment, Copilot enablement, and next steps into VS Code.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-700/40 dark:bg-blue-900/20">
            <h3 className="text-sm font-bold uppercase tracking-wide text-blue-800 dark:text-blue-300">How we use GitHub at Sage</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
              <li>Version control: full history, safe rollbacks, and auditability.</li>
              <li>Collaboration: pull requests and reviews to keep quality high.</li>
              <li>CI/CD: automation through pipelines and GitHub Actions.</li>
              <li>Security: dependency scanning, vulnerability alerts, and secret controls.</li>
            </ul>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700/40 dark:bg-amber-900/20">
            <h3 className="text-sm font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300">Part 1: GitHub Enrollment</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
              <li>Create or use a GitHub account with your @sage.com email as primary.</li>
              <li>Set your public profile to match your Sage email, full name, and profile picture.</li>
              <li>Enable 2FA and securely store recovery codes.</li>
              <li>Submit the enrollment form and accept the GitHub org invite within 7 days.</li>
              <li>Contact Steve for repository access guidance after enrollment completes.</li>
            </ol>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <CopyCard label="GitHub Sign Up" value="https://github.com/signup?ref_cta=Sign+up" link="https://github.com/signup?ref_cta=Sign+up" />
              <CopyCard label="2FA Settings" value="https://github.com/settings/security" link="https://github.com/settings/security" />
              <CopyCard label="Sage Enrollment Form" value="https://forms.office.com/r/ZyYP6C097i" link="https://forms.office.com/r/ZyYP6C097i" />
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3 text-sm dark:border-amber-700/50 dark:bg-gray-800/50">
              <div className="font-semibold text-gray-900 dark:text-white">Enrollment Form Help</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5 text-gray-700 dark:text-gray-200">
                <li>GitHub username format: firstname lastname + -sage (example: stevenoates-sage).</li>
                <li>Product: Intacct.</li>
                <li>Email: steve.oates@sage.com.</li>
                <li>Duration: One Year.</li>
                <li>Organization: Sage.</li>
              </ol>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-300">Then hit Submit.</div>
            </div>

            <button
              type="button"
              onClick={() => markProgress(PART1_ID, !part1Done)}
              className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${part1Done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              {part1Done ? 'Part 1 Complete ✓' : 'Mark Part 1 Complete'}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-700/40 dark:bg-emerald-900/20">
            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">Part 2: Enable GitHub Copilot</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-200">
              <li>Only after your GitHub account is active, submit the Copilot access request form.</li>
              <li>Open GitHub and click the Copilot icon in the top navigation.</li>
              <li>Follow prompts to authorize Copilot for your account and organizations.</li>
              <li>In VS Code, install the GitHub Copilot extension and sign in with your GitHub account.</li>
              <li>In VS Code, open the Copilot Chat panel and verify it responds.</li>
            </ol>
            <div className="mt-4 max-w-2xl">
              <CopyCard label="Copilot Request Form" value="https://forms.office.com/pages/responsepage.aspx?id=fN0yPvZBLUmho8WOsCz0-CA9zpGMGzJEgsImsTKj0C1UM1NRWTlNUVhRSUtaUFo2NjQ3RlhGTEk0QiQlQCN0PWcu" link="https://forms.office.com/pages/responsepage.aspx?id=fN0yPvZBLUmho8WOsCz0-CA9zpGMGzJEgsImsTKj0C1UM1NRWTlNUVhRSUtaUFo2NjQ3RlhGTEk0QiQlQCN0PWcu" />
            </div>
            <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3 text-sm dark:border-emerald-700/50 dark:bg-gray-800/50">
              Visual cue: after authorization, the Copilot icon in GitHub and VS Code should no longer show setup prompts.
            </div>

            <button
              type="button"
              onClick={() => markProgress(PART2_ID, !part2Done)}
              className={`mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${part2Done ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-700 hover:bg-emerald-800'}`}
            >
              {part2Done ? 'Part 2 Complete ✓' : 'Mark Part 2 Complete'}
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/30">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Next: VS Code Shipyard</h3>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
              Once enrollment and Copilot are complete, install and configure VS Code as your master dev tool.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => onOpenView?.('vscode-shipyard')} className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600">
                Open VS Code Shipyard Module
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!canMarkOverallDone}
              onClick={() => markOverall(!overallDone)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-gray-400 ${overallDone ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {overallDone ? 'GitHub Wings Complete ✓' : 'Mark GitHub Wings Complete'}
            </button>
            {!canMarkOverallDone && <span className="text-xs text-gray-600 dark:text-gray-300">Complete Part 1 and Part 2 to unlock this.</span>}
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          >
            Back to The Forge
          </button>
        </section>
        </div>
      </div>
    </div>
  );
}
