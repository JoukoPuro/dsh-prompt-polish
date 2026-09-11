/* dsh-prompt-polish — browser half (hand-built closure-factory bundle).
 *
 * Registered by client-modules as the `dsh-prompt-polish` boot row and served
 * at /plugins/dsh-prompt-polish/client.js. The factory runs at
 * materialization and receives the loader's module-table require; only
 * platform modules are external (react, ui-primitives), everything else is
 * inline.
 *
 * UI: an icon-only composer tool-row button ('conversation.input.right', a
 * sparkle glyph). Clicking it opens a style menu (balanced / concise /
 * detailed / code); picking a style POSTs the current draft to the Host's
 * /prompt-polish route and replaces the draft with the polished text.
 *
 * i18n: DSH's own locale system only ships zh/en ids (other browser
 * languages fall back to zh), so this bundle detects the browser language
 * itself and picks from its own dictionary table, which covers the major
 * world languages. The DSH locale seat stays registered as a fallback.
 */
window.__ModuleLoader__.load({
  id: 'dsh-prompt-polish',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var react = require('react');
    var primitives = require('@deepseek-ai/dsh-client-ui-primitives');

    var NS = 'promptPolish';

    /** Plugin-owned dictionaries keyed by primary language subtag. */
    var DICTS = {
      zh: {
        'title': '调用大模型优化提示词',
        'error': '提示词打磨失败：{message}',
        'style.balanced': '平衡打磨',
        'style.concise': '简洁精炼',
        'style.detailed': '详细展开',
        'style.code': '代码向',
      },
      en: {
        'title': 'Rewrite the prompt through the connected LLM',
        'error': 'Prompt polish failed: {message}',
        'style.balanced': 'Balanced',
        'style.concise': 'Concise',
        'style.detailed': 'Detailed',
        'style.code': 'Code-oriented',
      },
      ja: {
        'title': '接続済みの LLM でプロンプトを最適化',
        'error': 'プロンプトの最適化に失敗しました：{message}',
        'style.balanced': 'バランス',
        'style.concise': '簡潔',
        'style.detailed': '詳細',
        'style.code': 'コード向け',
      },
      ko: {
        'title': '연결된 LLM으로 프롬프트 최적화',
        'error': '프롬프트 최적화 실패: {message}',
        'style.balanced': '균형',
        'style.concise': '간결',
        'style.detailed': '상세',
        'style.code': '코드 중심',
      },
      fr: {
        'title': 'Réécrire le prompt via le LLM connecté',
        'error': 'Échec de la réécriture : {message}',
        'style.balanced': 'Équilibré',
        'style.concise': 'Concis',
        'style.detailed': 'Détaillé',
        'style.code': 'Orienté code',
      },
      de: {
        'title': 'Prompt über das verbundene LLM optimieren',
        'error': 'Prompt-Optimierung fehlgeschlagen: {message}',
        'style.balanced': 'Ausgewogen',
        'style.concise': 'Kurz',
        'style.detailed': 'Detailreich',
        'style.code': 'Code-orientiert',
      },
      es: {
        'title': 'Reescribir el prompt con el LLM conectado',
        'error': 'Error al reescribir: {message}',
        'style.balanced': 'Equilibrado',
        'style.concise': 'Conciso',
        'style.detailed': 'Detallado',
        'style.code': 'Orientado a código',
      },
      pt: {
        'title': 'Reescrever o prompt com o LLM conectado',
        'error': 'Falha ao reescrever: {message}',
        'style.balanced': 'Equilibrado',
        'style.concise': 'Conciso',
        'style.detailed': 'Detalhado',
        'style.code': 'Orientado a código',
      },
      ru: {
        'title': 'Улучшить промпт с помощью подключённой LLM',
        'error': 'Не удалось улучшить промпт: {message}',
        'style.balanced': 'Сбалансированный',
        'style.concise': 'Краткий',
        'style.detailed': 'Подробный',
        'style.code': 'Для кода',
      },
      it: {
        'title': 'Riscrivi il prompt con il LLM connesso',
        'error': 'Riscrittura fallita: {message}',
        'style.balanced': 'Equilibrato',
        'style.concise': 'Conciso',
        'style.detailed': 'Dettagliato',
        'style.code': 'Orientato al codice',
      },
      tr: {
        'title': 'Bağlı LLM ile komut istemini yeniden yaz',
        'error': 'Komut istemi yeniden yazılamadı: {message}',
        'style.balanced': 'Dengeli',
        'style.concise': 'Kısa',
        'style.detailed': 'Ayrıntılı',
        'style.code': 'Kod odaklı',
      },
      vi: {
        'title': 'Viết lại lời nhắc qua LLM đã kết nối',
        'error': 'Không thể viết lại lời nhắc: {message}',
        'style.balanced': 'Cân bằng',
        'style.concise': 'Ngắn gọn',
        'style.detailed': 'Chi tiết',
        'style.code': 'Hướng mã',
      },
    };

    /** Primary language subtags the table covers; en is the universal fallback. */
    var SUPPORTED = Object.keys(DICTS);

    /**
     * Detect the user's language from the browser's ordered preference list.
     * @returns a dictionary key from {@link DICTS} (never undefined; 'en' fallback).
     */
    function detectLang() {
      if (typeof navigator === 'undefined') return 'en';
      var tags = [];
      if (navigator.languages && navigator.languages.length > 0) {
        tags = navigator.languages;
      } else if (typeof navigator.language === 'string' && navigator.language.length > 0) {
        tags = [navigator.language];
      }
      for (var i = 0; i < tags.length; i++) {
        var primary = String(tags[i]).toLowerCase().split('-')[0];
        if (SUPPORTED.indexOf(primary) !== -1) return primary;
      }
      return 'en';
    }

    var styleItems = [
      { id: 'balanced', icon: 'edit' },
      { id: 'concise', icon: 'checklist' },
      { id: 'detailed', icon: 'list' },
      { id: 'code', icon: 'code' },
    ];

    /** Map a menu icon key to the primitives icon element. */
    function styleIcon(key) {
      switch (key) {
        case 'edit': return react.createElement(primitives.IconEditOutline16, null);
        case 'checklist': return react.createElement(primitives.IconChecklistOutline14, null);
        case 'list': return react.createElement(primitives.IconListPenOutline16, null);
        case 'code': return react.createElement(primitives.IconCodeOutline16, null);
        default: return null;
      }
    }

    /** Icon-only composer tool-row button + style menu. */
    function PolishButton(props) {
      var busyState = react.useState(false);
      var busy = busyState[0];
      var setBusy = busyState[1];
      var errorState = react.useState(null);
      var error = errorState[0];
      var setError = errorState[1];
      var openState = react.useState(false);
      var open = openState[0];
      var setOpen = openState[1];
      var langState = react.useState(detectLang);
      var lang = langState[0];
      var setLang = langState[1];

      // Re-detect on browser language change (settings/OS switch while open).
      react.useEffect(function () {
        var onLang = function () { setLang(detectLang()); };
        window.addEventListener('languagechange', onLang);
        return function () { window.removeEventListener('languagechange', onLang); };
      }, []);

      var dict = DICTS[lang] || DICTS.en;
      var tr = function (key, params) {
        var text = dict[key] || DICTS.en[key] || key;
        if (params) {
          for (var name in params) {
            if (Object.prototype.hasOwnProperty.call(params, name)) {
              text = text.split('{' + name + '}').join(String(params[name]));
            }
          }
        }
        return text;
      };

      // Draft access. DSH >= 0.1.5 removed the InputZone owner props from
      // 'conversation.input.*' slots (owner props are now `{}`); the draft
      // arrives through the standard session kit instead: the `input` hook
      // (synthesized to `useInput`) plus the `inputActions` prop. The old
      // owner-props form is kept as a fallback for DSH <= 0.1.0-rc.6, where
      // `useInput` is absent. Whichever branch applies is constant for a
      // given DSH version, so hook order stays stable across renders.
      var useInputHook = props.useInput;
      var inputState = typeof useInputHook === 'function'
        ? useInputHook(function (s) { return s; })
        : props.input;
      var draft = inputState && typeof inputState.draft === 'string' ? inputState.draft : '';
      var setDraft = props.inputActions && props.inputActions.setDraft;

      var canPolish = !busy && draft.trim().length > 0 && typeof setDraft === 'function';

      /** Run one polish with the selected style. */
      var run = function (style) {
        if (!canPolish) return;
        setOpen(false);
        setBusy(true);
        setError(null);
        fetch('/prompt-polish', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ text: draft, style: style }),
        }).then(function (res) {
          return res.json().then(function (data) {
            return { res: res, data: data };
          });
        }).then(function (out) {
          if (!out.res.ok || !out.data || out.data.ok !== true) {
            throw new Error((out.data && out.data.error) || ('HTTP ' + out.res.status));
          }
          setDraft(out.data.text);
        }).catch(function (err) {
          setError(err && err.message ? err.message : String(err));
        }).finally(function () {
          setBusy(false);
        });
      };

      var menuItems = styleItems.map(function (item) {
        return {
          id: item.id,
          label: tr('style.' + item.id),
          icon: styleIcon(item.icon),
        };
      });

      // Icon-only trigger: sparkle while idle, spinner while polishing.
      var triggerIcon = busy
        ? react.createElement(primitives.IconLoadingOutline16, null)
        : react.createElement(primitives.IconSparkle16, null);
      var trigger = react.createElement(primitives.Button, {
        variant: 'toolbar',
        size: 'sm',
        icon: triggerIcon,
        onClick: function () { if (canPolish) setOpen(!open); },
        disabled: !canPolish,
        title: tr('title'),
        'aria-label': tr('title'),
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      });

      return react.createElement(
        react.Fragment,
        null,
        react.createElement(primitives.Menu, {
          open: open,
          anchor: trigger,
          items: menuItems,
          onSelect: run,
          onClose: function () { setOpen(false); },
          align: 'end',
          side: 'top',
          portal: true,
        }),
        error !== null
          ? react.createElement(primitives.Toast, {
            text: tr('error', { message: error }),
            onDone: function () { setError(null); },
          })
          : null,
      );
    }

    exports.name = 'prompt-polish';
    exports.inject = ['slots', 'locale'];

    exports.apply = function (ctx) {
      // Keep the DSH locale seat registered (zh/en) as a fallback surface.
      ctx.effect(
        function () {
          return ctx.locale.register(NS, {
            zh: DICTS.zh,
            en: DICTS.en,
          });
        },
        'prompt-polish: dictionaries',
      );
      ctx.slots.inject('conversation.input.right', function () {
        return ctx.slots.register({
          name: 'conversation.input.right',
          id: 'prompt-polish',
          locale: NS,
        }, PolishButton);
      });
    };

    return module.exports;
  },
});

//# sourceMappingURL=client.js.map
