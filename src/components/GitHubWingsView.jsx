import React from 'react';

export default function GitHubWingsView({ onBack }) {
  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Get Your GitHub Wings</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Placeholder training page. Add your full onboarding steps, exercises, and links here.
          </p>
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-700/40 dark:text-gray-300">
            Suggested sections:
            <ul className="mt-2 list-disc pl-5">
              <li>GitHub account setup and permissions</li>
              <li>Clone, branch, commit, and pull request flow</li>
              <li>Project contribution checklist</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Back to The Forge
          </button>
        </section>
      </div>
    </div>
  );
}
