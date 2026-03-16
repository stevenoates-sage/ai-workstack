import React from 'react';
import { LEARNING_GUIDES } from '../data/learningGuides';
import { getAllGuideProgressForUser } from '../utils/progressStore';

const formatDate = (value) => {
  if (!value) return 'Never';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Never';
  return d.toLocaleString();
};

export default function ForgeView({ currentUser, onOpenView }) {
  const guideProgress = getAllGuideProgressForUser(currentUser);

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Forge</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">A practice area for guided learning, experimentation, and progress tracking.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <button
              onClick={() => onOpenView('bootcamp')}
              type="button"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/40 dark:hover:border-blue-500 dark:hover:bg-gray-700"
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Open Bootcamp</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Launch the AI Analyst Weekend Bootcamp.</div>
            </button>

            <button
              onClick={() => onOpenView('vibe')}
              type="button"
              className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/40 dark:hover:border-blue-500 dark:hover:bg-gray-700"
            >
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Open Vibe Coding</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Jump into the Vibe Coding workspace.</div>
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Progress</h3>
          <div className="mt-4 space-y-3">
            {LEARNING_GUIDES.map((guide) => {
              const progress = guideProgress[guide.id] || {};
              const percent = progress.percent || 0;
              return (
                <article key={guide.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700/40">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{guide.title}</div>
                      <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Last saved: {formatDate(progress.updatedAt)}</div>
                    </div>
                    <button
                      onClick={() => onOpenView(guide.route)}
                      type="button"
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Continue
                    </button>
                  </div>
                  <div className="mt-3 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-700 dark:text-gray-200">{percent}% complete</div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
