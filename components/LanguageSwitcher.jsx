import { useEffect, useRef, useState } from 'react';
import { useI18n, searchLanguages, langDisplayName } from '../lib/i18n';
import { IconGlobe } from './icons';

// Bo doi ngon ngu giao dien web - danh sach hon 300 ngon ngu, co the go tim
// theo ma (en, vi...) hoac ten (English, Tieng Viet...).
export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const results = searchLanguages(query, 40);

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        title={t('language_switcher_title')}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 whitespace-nowrap"
      >
        <IconGlobe className="w-4 h-4" />
        <span className="hidden md:inline uppercase">{lang}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 max-h-96 overflow-hidden flex flex-col bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50">
          <div className="p-2 border-b border-gray-800">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('language_search_placeholder')}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {results.map(row => (
              <button
                key={row.code}
                type="button"
                onClick={() => { setLang(row.code); setOpen(false); setQuery(''); }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-800 ${
                  row.code.toLowerCase() === lang.toLowerCase() ? 'bg-indigo-900/40 text-indigo-300' : 'text-gray-300'
                }`}
              >
                <span className="truncate">{row.name_native} <span className="text-gray-500">({row.name_en})</span></span>
                <span className="text-xs text-gray-600 uppercase flex-shrink-0 ml-2">{row.code}</span>
              </button>
            ))}
            {results.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-600 text-center">∅</div>
            )}
          </div>
          <div className="px-3 py-1.5 border-t border-gray-800 text-[10px] text-gray-600">
            {t('language')}: {langDisplayName(lang)}
          </div>
        </div>
      )}
    </div>
  );
}
