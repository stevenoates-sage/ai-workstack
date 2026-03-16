import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, BookMarked, CalendarClock, CheckCircle2, ChevronDown, ChevronRight, Download, FileText, Table } from 'lucide-react';
import { LEARNING_GUIDES } from '../data/learningGuides';
import { getGuideProgress, setGuideProgress } from '../utils/progressStore';

const guide = LEARNING_GUIDES[0];

const iconFor = (kind) => (kind === 'data' ? Table : FileText);

const formatDate = (value) => {
  if (!value) return 'Not started yet';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not started yet';
  return d.toLocaleString();
};

export default function BootcampView({ currentUser }) {
  const iframeRef = useRef(null);
  const leftRailRef = useRef(null);
  const sectionsRef = useRef([]);
  const saveTimerRef = useRef(null);
  const cleanupScrollRef = useRef(null);
  const progressRef = useRef({
    percent: 0,
    anchor: null,
    completedSections: {},
    completedSubsections: {},
    updatedAt: null,
  });
  const completedSectionsRef = useRef({});
  const completedSubsectionsRef = useRef({});
  const [tocLinks, setTocLinks] = useState([]);
  const [expandedSections, setExpandedSections] = useState({});
  const [contentHeight, setContentHeight] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [progress, setProgress] = useState({
    percent: 0,
    anchor: null,
    completedSections: {},
    completedSubsections: {},
    updatedAt: null,
  });

  useEffect(() => {
    const existing = getGuideProgress(currentUser, guide.id);
    if (existing) {
      const normalized = {
        percent: existing.percent || 0,
        anchor: existing.anchor || null,
        completedSections: existing.completedSections || existing.completedAnchors || {},
        completedSubsections: existing.completedSubsections || {},
        updatedAt: existing.updatedAt || null,
      };

      setProgress((prev) => ({ ...prev, ...normalized }));
      progressRef.current = { ...progressRef.current, ...normalized };
      completedSectionsRef.current = normalized.completedSections;
      completedSubsectionsRef.current = normalized.completedSubsections;
    }
  }, [currentUser]);

  useEffect(() => {
    const syncHeight = () => {
      if (window.innerWidth < 1024 || !leftRailRef.current) {
        setContentHeight(null);
        return;
      }

      const h = Math.round(leftRailRef.current.getBoundingClientRect().height);
      setContentHeight(Math.max(520, h));
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);

    let ro = null;
    if (typeof ResizeObserver !== 'undefined' && leftRailRef.current) {
      ro = new ResizeObserver(syncHeight);
      ro.observe(leftRailRef.current);
    }

    return () => {
      window.removeEventListener('resize', syncHeight);
      if (ro) {
        ro.disconnect();
      }
    };
  }, []);

  const isSectionComplete = (section, completedSections, completedSubsections) => {
    if (completedSections[section.anchor]) {
      return true;
    }

    if (!section.children.length) {
      return false;
    }

    return section.children.every((child) => completedSubsections[child.id]);
  };

  const calculatePercent = (sections, completedSections, completedSubsections) => {
    if (!sections.length) {
      return 0;
    }

    const doneCount = sections.filter((section) => isSectionComplete(section, completedSections, completedSubsections)).length;
    return Math.round((doneCount / sections.length) * 100);
  };

  const persistProgress = (patch) => {
    const merged = {
      ...progressRef.current,
      ...patch,
    };

    merged.percent = calculatePercent(
      sectionsRef.current,
      merged.completedSections || {},
      merged.completedSubsections || {},
    );

    const saved = setGuideProgress(currentUser, guide.id, merged);
    progressRef.current = { ...progressRef.current, ...saved };
    completedSectionsRef.current = progressRef.current.completedSections || {};
    completedSubsectionsRef.current = progressRef.current.completedSubsections || {};
    setProgress((prev) => ({ ...prev, ...saved }));
  };

  const findCurrentSection = (doc, scrollTop) => {
    const anchors = Array.from(doc.querySelectorAll('h1[id], h2[id], h3[id], section[id]')).filter(
      (node) => node.offsetParent !== null,
    );
    if (!anchors.length) {
      return { anchor: null };
    }

    const current =
      anchors
        .filter((node) => node.offsetTop <= scrollTop + 90)
        .sort((a, b) => b.offsetTop - a.offsetTop)[0] || anchors[0];

    const anchor = current.id || null;
    return { anchor };
  };

  const applyPaginationView = (index) => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc || !sectionsRef.current.length) {
      return;
    }

    const clamped = Math.max(0, Math.min(index, sectionsRef.current.length - 1));

    sectionsRef.current.forEach((section, idx) => {
      const node = doc.getElementById(section.anchor);
      if (!node) return;
      node.style.display = idx === clamped ? 'block' : 'none';
    });

    doc.querySelectorAll('hr.divider').forEach((node) => {
      node.style.display = 'none';
    });
  };

  const getSectionIndexByAnchor = (anchor) => {
    if (!anchor) return -1;
    return sectionsRef.current.findIndex(
      (section) => section.anchor === anchor || section.children.some((child) => child.id === anchor),
    );
  };

  const goToPage = (index, anchor = null) => {
    if (!sectionsRef.current.length) {
      return;
    }

    const clamped = Math.max(0, Math.min(index, sectionsRef.current.length - 1));
    const targetAnchor = anchor || sectionsRef.current[clamped]?.anchor || null;

    setCurrentPageIndex(clamped);
    persistProgress({
      anchor: targetAnchor,
      completedSections: completedSectionsRef.current,
      completedSubsections: completedSubsectionsRef.current,
    });
  };

  const readSidebarLinks = (doc) => {
    const nav = doc.querySelector('#sidebar nav');
    if (!nav) {
      return [];
    }

    const links = [];
    let currentGroup = 'Sections';

    Array.from(nav.children).forEach((node) => {
      if (node.classList?.contains('section-label')) {
        currentGroup = (node.textContent || '').trim() || 'Sections';
        return;
      }

      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || '';
        if (!href.startsWith('#')) {
          return;
        }

        const anchor = href.slice(1);
        const label = (node.textContent || '').trim();
        if (!anchor || !label) {
          return;
        }

        links.push({ anchor, label, group: currentGroup, children: [] });
      }
    });

    return links;
  };

  const buildSectionTree = (doc, links) => {
    return links.map((section) => {
      const sectionEl = doc.getElementById(section.anchor);
      if (!sectionEl) {
        return section;
      }

      const headings = Array.from(sectionEl.querySelectorAll('h2, h3')).filter((node) => (node.textContent || '').trim());
      const children = headings.map((heading, index) => {
        if (!heading.id) {
          heading.id = `${section.anchor}-sub-${index + 1}`;
        }

        return {
          id: heading.id,
          label: (heading.textContent || '').trim(),
        };
      });

      return {
        ...section,
        children,
      };
    });
  };

  const disableEmbeddedGuideMenu = (doc) => {
    const sidebar = doc.getElementById('sidebar');
    const toggle = doc.getElementById('sidebar-toggle');
    const main = doc.getElementById('main');
    const progressBar = doc.getElementById('progress');

    if (!main) {
      return;
    }

    if (sidebar) {
      sidebar.style.display = 'none';
    }

    if (toggle) {
      toggle.style.display = 'none';
    }

    main.classList.add('centred');
    main.style.marginLeft = '0';
    main.style.width = '100%';

    if (progressBar?.style) {
      progressBar.style.left = '0px';
    }
  };

  const upsertSectionCompletion = (anchor, checked) => {
    const nextCompletedSections = {
      ...completedSectionsRef.current,
    };

    if (checked) {
      nextCompletedSections[anchor] = true;
    } else {
      delete nextCompletedSections[anchor];
    }

    completedSectionsRef.current = nextCompletedSections;
    const patch = {
      anchor,
      completedSections: nextCompletedSections,
      completedSubsections: completedSubsectionsRef.current,
    };

    persistProgress(patch);
    const doc = iframeRef.current?.contentDocument;
    if (doc && sectionsRef.current.length) {
      renderContentChecklist(doc, sectionsRef.current);
    }
  };

  const upsertSubsectionCompletion = (sectionAnchor, subsectionId, checked) => {
    const nextCompletedSubsections = {
      ...completedSubsectionsRef.current,
    };

    if (checked) {
      nextCompletedSubsections[subsectionId] = true;
    } else {
      delete nextCompletedSubsections[subsectionId];
    }

    completedSubsectionsRef.current = nextCompletedSubsections;

    // Parent section can be overridden manually, so clear the manual flag when child items change.
    const nextCompletedSections = {
      ...completedSectionsRef.current,
    };
    delete nextCompletedSections[sectionAnchor];
    completedSectionsRef.current = nextCompletedSections;

    const patch = {
      anchor: sectionAnchor,
      completedSections: nextCompletedSections,
      completedSubsections: nextCompletedSubsections,
    };

    persistProgress(patch);
    const doc = iframeRef.current?.contentDocument;
    if (doc && sectionsRef.current.length) {
      renderContentChecklist(doc, sectionsRef.current);
    }
  };

  const renderContentChecklist = (doc, sections) => {
    doc.querySelectorAll('.aw-section-check, .aw-subsection-check').forEach((node) => node.remove());

    sections.forEach((item) => {
      const target = doc.getElementById(item.anchor);
      if (!target) {
        return;
      }

      const host = target.closest('section') || target.parentElement;
      if (!host) {
        return;
      }

      const wrapper = doc.createElement('div');
      wrapper.className = 'aw-section-check';
      wrapper.style.marginTop = '14px';
      wrapper.style.padding = '10px 12px';
      wrapper.style.border = '1px solid #253545';
      wrapper.style.borderRadius = '8px';
      wrapper.style.background = '#101a28';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'center';
      wrapper.style.gap = '8px';

      const checkbox = doc.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = isSectionComplete(item, completedSectionsRef.current, completedSubsectionsRef.current);
      checkbox.style.width = '14px';
      checkbox.style.height = '14px';
      checkbox.style.accentColor = '#16a34a';

      const label = doc.createElement('label');
      label.textContent = `Mark section done: ${item.label}`;
      label.style.fontSize = '12px';
      label.style.color = '#c8d8e8';
      label.style.userSelect = 'none';

      checkbox.addEventListener('change', () => {
        upsertSectionCompletion(item.anchor, checkbox.checked);
      });

      wrapper.appendChild(checkbox);
      wrapper.appendChild(label);
      host.appendChild(wrapper);

      item.children.forEach((child) => {
        const childHeading = doc.getElementById(child.id);
        if (!childHeading) {
          return;
        }

        const sectionRoot = target.closest('section') || target.parentElement;
        if (!sectionRoot) {
          return;
        }

        const subWrap = doc.createElement('div');
        subWrap.className = 'aw-subsection-check';
        subWrap.style.marginTop = '8px';
        subWrap.style.marginBottom = '12px';
        subWrap.style.padding = '10px 12px';
        subWrap.style.border = '1px solid #253545';
        subWrap.style.borderRadius = '8px';
        subWrap.style.background = '#0d1e2e';
        subWrap.style.display = 'flex';
        subWrap.style.alignItems = 'center';
        subWrap.style.gap = '8px';

        const subCheckbox = doc.createElement('input');
        subCheckbox.type = 'checkbox';
        subCheckbox.checked = Boolean(completedSubsectionsRef.current[child.id]);
        subCheckbox.style.width = '14px';
        subCheckbox.style.height = '14px';
        subCheckbox.style.accentColor = '#16a34a';

        const subLabel = doc.createElement('label');
        subLabel.textContent = `Mark step done: ${child.label}`;
        subLabel.style.fontSize = '12.5px';
        subLabel.style.fontWeight = '600';
        subLabel.style.color = '#c8d8e8';
        subLabel.style.userSelect = 'none';

        subCheckbox.addEventListener('change', () => {
          upsertSubsectionCompletion(item.anchor, child.id, subCheckbox.checked);
        });

        subWrap.appendChild(subCheckbox);
        subWrap.appendChild(subLabel);

        // Insert at the end of this step block (right before the next step heading).
        let cursor = childHeading.nextSibling;
        let nextHeading = null;
        while (cursor) {
          if (cursor.nodeType === Node.ELEMENT_NODE) {
            const el = cursor;
            if (el.matches('h2, h3')) {
              nextHeading = el;
              break;
            }
          }
          cursor = cursor.nextSibling;
        }

        if (nextHeading) {
          sectionRoot.insertBefore(subWrap, nextHeading);
        } else {
          sectionRoot.appendChild(subWrap);
        }
      });
    });
  };

  const attachProgressTracker = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    if (cleanupScrollRef.current) {
      cleanupScrollRef.current();
      cleanupScrollRef.current = null;
    }

    const links = readSidebarLinks(doc);
    const sectionTree = buildSectionTree(doc, links);
    sectionsRef.current = sectionTree;
    setTocLinks(sectionTree);
    setExpandedSections((prev) => {
      const next = { ...prev };
      sectionTree.forEach((section) => {
        if (next[section.anchor] === undefined) {
          next[section.anchor] = false;
        }
      });
      return next;
    });
    disableEmbeddedGuideMenu(doc);

    const existing = getGuideProgress(currentUser, guide.id);
    const normalizedSections = {
      ...(existing?.completedSections || existing?.completedAnchors || {}),
    };
    const normalizedSubsections = {
      ...(existing?.completedSubsections || {}),
    };
    completedSectionsRef.current = normalizedSections;
    completedSubsectionsRef.current = normalizedSubsections;
    renderContentChecklist(doc, sectionTree);

    if (existing?.anchor) {
      const target = doc.getElementById(existing.anchor);
      if (target) {
        target.scrollIntoView({ block: 'start' });
      }
    }

    const initialPercent = calculatePercent(sectionTree, normalizedSections, normalizedSubsections);
    const initialIndex = Math.max(0, getSectionIndexByAnchor(existing?.anchor));
    setProgress((prev) => ({
      ...prev,
      percent: initialPercent,
      completedSections: normalizedSections,
      completedSubsections: normalizedSubsections,
      anchor: existing?.anchor || prev.anchor,
    }));
    setCurrentPageIndex(initialIndex);
    progressRef.current = {
      ...progressRef.current,
      percent: initialPercent,
      completedSections: normalizedSections,
      completedSubsections: normalizedSubsections,
      anchor: existing?.anchor || progressRef.current.anchor,
    };
    applyPaginationView(initialIndex);

    const onScroll = () => {
      const current = findCurrentSection(doc, win.scrollY);
      const percent = calculatePercent(
        sectionsRef.current,
        completedSectionsRef.current,
        completedSubsectionsRef.current,
      );
      const next = {
        percent,
        anchor: current.anchor,
        completedSections: completedSectionsRef.current,
        completedSubsections: completedSubsectionsRef.current,
      };

      setProgress((prev) => ({ ...prev, ...next }));

      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = window.setTimeout(() => {
        persistProgress(next);
      }, 300);
    };

    win.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    cleanupScrollRef.current = () => {
      win.removeEventListener('scroll', onScroll);
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  };

  const jumpToAnchor = (anchor) => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;

    const idx = getSectionIndexByAnchor(anchor);
    if (idx >= 0) {
      goToPage(idx, anchor);
      window.setTimeout(() => {
        const target = iframe.contentDocument.getElementById(anchor);
        if (target) {
          target.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    const target = iframe.contentDocument.getElementById(anchor);
    if (target) {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  const handleResume = () => {
    const idx = getSectionIndexByAnchor(progress.anchor);
    if (idx >= 0) {
      goToPage(idx, progress.anchor);
    }
  };

  const toggleSectionExpanded = (anchor) => {
    setExpandedSections((prev) => ({
      ...prev,
      [anchor]: !prev[anchor],
    }));
  };

  const handlePreviousPage = () => {
    goToPage(currentPageIndex - 1);
  };

  const handleNextPage = () => {
    const current = sectionsRef.current[currentPageIndex];
    if (!current) return;

    upsertSectionCompletion(current.anchor, true);
    goToPage(currentPageIndex + 1);
  };

  useEffect(() => {
    applyPaginationView(currentPageIndex);
  }, [currentPageIndex, tocLinks]);

  return (
    <div className="h-full overflow-y-auto bg-gray-100 p-6 dark:bg-gray-900">
      <div className="mx-auto grid max-w-[1800px] gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside ref={leftRailRef} className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
              <BookMarked size={17} className="text-blue-600 dark:text-blue-300" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Progress</h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Completion</div>
                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-2.5 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <div className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-100">{progress.percent}% complete</div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">Legend</div>
                <div className="flex items-center gap-4 text-xs text-gray-700 dark:text-gray-200">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-full border border-gray-400 bg-transparent dark:border-white" /> Not started
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="text-green-600 dark:text-green-400" size={14} /> Complete
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700/40">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Guide Sections</div>
                <div className="space-y-1.5">
                  {tocLinks.map((item, index) => {
                    const done = isSectionComplete(item, progress.completedSections || {}, progress.completedSubsections || {});
                    const isExpanded = Boolean(expandedSections[item.anchor]);
                    const showGroup = index === 0 || tocLinks[index - 1].group !== item.group;
                    return (
                      <div key={item.anchor}>
                        {showGroup && (
                          <div className="mb-1 mt-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                            {item.group}
                          </div>
                        )}
                        <div className="rounded-lg transition hover:bg-blue-50 dark:hover:bg-gray-700">
                          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                            <button
                              onClick={() => jumpToAnchor(item.anchor)}
                              className="min-w-0 flex-1 text-left text-sm leading-snug text-gray-800 dark:text-gray-100"
                              type="button"
                            >
                              {item.label}
                            </button>

                            <div className="flex items-center gap-1">
                              {item.children.length > 0 && (
                                <button
                                  onClick={() => toggleSectionExpanded(item.anchor)}
                                  className="rounded p-0.5 text-gray-500 hover:bg-white dark:hover:bg-gray-600"
                                  type="button"
                                >
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                              )}
                              {done ? (
                                <CheckCircle2 className="shrink-0 text-green-600 dark:text-green-400" size={16} />
                              ) : (
                                <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-gray-400 bg-transparent dark:border-white" />
                              )}
                            </div>
                          </div>

                          {isExpanded && item.children.length > 0 && (
                            <div className="mb-1 ml-4 mr-1 space-y-1 border-l border-gray-300 pl-2 dark:border-gray-600">
                              {item.children.map((child) => (
                                <div key={child.id} className="flex items-start gap-2 rounded px-1 py-1 text-xs text-gray-700 hover:bg-white dark:text-gray-200 dark:hover:bg-gray-600">
                                  <span className="mt-0.5 inline-flex items-center">
                                    {progress.completedSubsections?.[child.id] ? (
                                      <CheckCircle2 className="text-green-600 dark:text-green-400" size={14} />
                                    ) : (
                                      <span className="inline-block h-3 w-3 rounded-full border border-gray-400 bg-transparent dark:border-white" />
                                    )}
                                  </span>
                                  <button
                                    onClick={() => jumpToAnchor(child.id)}
                                    type="button"
                                    className="text-left leading-snug break-words"
                                  >
                                    {child.label}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {!tocLinks.length && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">Loading sections...</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <CalendarClock size={14} /> Last saved: {formatDate(progress.updatedAt)}
              </div>

              <button
                onClick={handleResume}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                type="button"
              >
                <CheckCircle2 size={15} /> Resume where I left off
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-base font-semibold text-gray-900 dark:text-white">Downloads</h3>
            <div className="space-y-3">
              {guide.files.map((file) => {
                const Icon = iconFor(file.kind);
                return (
                  <a
                    key={file.name}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 transition hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-700/40 dark:hover:border-blue-500 dark:hover:bg-gray-700"
                    href={file.href}
                    download
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300" size={16} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-gray-900 dark:text-white">{file.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">{file.description}</div>
                      </div>
                    </div>
                    <Download className="shrink-0 text-gray-500 dark:text-gray-300" size={15} />
                  </a>
                );
              })}
            </div>
          </section>
        </aside>

        <div>
          <section
            className="flex flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            style={contentHeight ? { height: `${contentHeight}px` } : undefined}
          >
            <iframe
              ref={iframeRef}
              className="min-h-0 flex-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-600"
              src={guide.guideUrl}
              title="AI Analyst Weekend Bootcamp Guide"
              onLoad={attachProgressTracker}
            />

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-600 dark:bg-gray-700/40">
              <button
                onClick={handlePreviousPage}
                disabled={currentPageIndex <= 0}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-500 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
                type="button"
              >
                <ArrowLeft size={14} /> Previous
              </button>

              <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Page {Math.min(currentPageIndex + 1, Math.max(1, tocLinks.length))} of {Math.max(1, tocLinks.length)}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPageIndex >= tocLinks.length - 1}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
              >
                Next <ArrowRight size={14} />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
