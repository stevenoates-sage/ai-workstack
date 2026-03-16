import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'revops-colleseum-posts-v1';

const readPosts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writePosts = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  } catch {
    // Ignore storage issues in private browsing mode.
  }
};

export default function ColleseumView({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', story: '', link: '' });

  useEffect(() => {
    setPosts(readPosts());
  }, []);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [posts],
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.story.trim()) {
      return;
    }

    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        author: currentUser?.name || currentUser?.email || 'Anonymous',
        title: form.title.trim(),
        story: form.story.trim(),
        link: form.link.trim(),
        likes: 0,
        createdAt: new Date().toISOString(),
      },
      ...posts,
    ];

    setPosts(next);
    writePosts(next);
    setForm({ title: '', story: '', link: '' });
  };

  const likePost = (id) => {
    const next = posts.map((post) => (post.id === id ? { ...post, likes: (post.likes || 0) + 1 } : post));
    setPosts(next);
    writePosts(next);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">The Colleseum</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Share ideas, links, wins, and lessons learned with the wider RevOps community.</p>

          <form className="mt-5 grid gap-3" onSubmit={handleSubmit}>
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white"
              placeholder="Post title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            />
            <textarea
              className="min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white"
              placeholder="Idea, success story, or useful insight"
              value={form.story}
              onChange={(event) => setForm((prev) => ({ ...prev, story: event.target.value }))}
            />
            <input
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-700/40 dark:text-white"
              placeholder="Optional link (https://...)"
              value={form.link}
              onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
            />
            <button
              type="submit"
              className="w-fit rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Post to Colleseum
            </button>
          </form>
        </section>

        <section className="space-y-4">
          {sortedPosts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{post.title}</h3>
                <div className="text-xs text-gray-500 dark:text-gray-300">{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">Posted by {post.author}</div>
              <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{post.story}</p>
              {post.link && (
                <a className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-300" href={post.link} target="_blank" rel="noreferrer">
                  {post.link}
                </a>
              )}
              <button
                type="button"
                onClick={() => likePost(post.id)}
                className="mt-4 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                Like ({post.likes || 0})
              </button>
            </article>
          ))}

          {sortedPosts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
              No posts yet. Share the first idea or success story.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
