import React from 'react';
import { ArrowRight, BookOpenCheck, CalendarClock, ChartNoAxesColumn } from 'lucide-react';
import { LEARNING_GUIDES } from '../data/learningGuides';
import { getAllGuideProgressForUser } from '../utils/progressStore';

const formatDate = (value) => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString();
};

export default function MyProgressView({ currentUser, onOpenGuide }) {
  const progressByGuide = getAllGuideProgressForUser(currentUser);
  const totalPercent = LEARNING_GUIDES.length
    ? Math.round(
        LEARNING_GUIDES.reduce((sum, guide) => sum + (progressByGuide[guide.id]?.percent || 0), 0) /
          LEARNING_GUIDES.length,
      )
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Progress</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Track learning progress across bootcamps and guides. This is your personal skill tracker and will expand as new content is added.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <BookOpenCheck size={14} /> Guides
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{LEARNING_GUIDES.length}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <ChartNoAxesColumn size={14} /> Average Progress
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalPercent}%</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                <CalendarClock size={14} /> Learner
              </div>
              <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{currentUser?.email || currentUser?.name || 'Unknown user'}</div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {LEARNING_GUIDES.map((guide) => {
            const progress = progressByGuide[guide.id] || {};
            const percent = progress.percent || 0;
            const section = progress.section || 'Not started';

            return (
              <article
                key={guide.id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{guide.title}</h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{guide.description}</p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Last saved: {formatDate(progress.updatedAt)}</p>
                  </div>

                  <button
                    onClick={() => onOpenGuide(guide.route)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    type="button"
                  >
                    Open Guide <ArrowRight size={15} />
                  </button>
                </div>

                <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2.5 rounded-full bg-blue-600 transition-all" style={{ width: `${percent}%` }} />
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between text-sm">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">{percent}% complete</span>
                  <span className="text-gray-600 dark:text-gray-300">Current section: {section}</span>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
