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
        'error': '提示词润色失败：{message}',
        'error.network': '无法连接服务，请刷新页面后重试',
        'style.balanced': '平衡润色',
        'style.concise': '简洁精炼',
        'style.detailed': '详细展开',
        'style.code': '代码向',
      },
      en: {
        'title': 'Rewrite the prompt through the connected LLM',
        'error': 'Prompt polish failed: {message}',
        'error.network': 'Could not reach the service — reload the page and try again',
        'style.balanced': 'Balanced',
        'style.concise': 'Concise',
        'style.detailed': 'Detailed',
        'style.code': 'Code-oriented',
      },
      ja: {
        'title': '接続済みの LLM でプロンプトを最適化',
        'error': 'プロンプトの最適化に失敗しました：{message}',
        'error.network': 'サービスに接続できません。ページを再読み込みしてください',
        'style.balanced': 'バランス',
        'style.concise': '簡潔',
        'style.detailed': '詳細',
        'style.code': 'コード向け',
      },
      ko: {
        'title': '연결된 LLM으로 프롬프트 최적화',
        'error': '프롬프트 최적화 실패: {message}',
        'error.network': '서비스에 연결할 수 없습니다. 페이지를 새로고침하세요',
        'style.balanced': '균형',
        'style.concise': '간결',
        'style.detailed': '상세',
        'style.code': '코드 중심',
      },
      fr: {
        'title': 'Réécrire le prompt via le LLM connecté',
        'error': 'Échec de la réécriture : {message}',
        'error.network': 'Service injoignable — rechargez la page et réessayez',
        'style.balanced': 'Équilibré',
        'style.concise': 'Concis',
        'style.detailed': 'Détaillé',
        'style.code': 'Orienté code',
      },
      de: {
        'title': 'Prompt über das verbundene LLM optimieren',
        'error': 'Prompt-Optimierung fehlgeschlagen: {message}',
        'error.network': 'Dienst nicht erreichbar — Seite neu laden und erneut versuchen',
        'style.balanced': 'Ausgewogen',
        'style.concise': 'Kurz',
        'style.detailed': 'Detailreich',
        'style.code': 'Code-orientiert',
      },
      es: {
        'title': 'Reescribir el prompt con el LLM conectado',
        'error': 'Error al reescribir: {message}',
        'error.network': 'No se pudo contactar el servicio: recarga la página e inténtalo de nuevo',
        'style.balanced': 'Equilibrado',
        'style.concise': 'Conciso',
        'style.detailed': 'Detallado',
        'style.code': 'Orientado a código',
      },
      pt: {
        'title': 'Reescrever o prompt com o LLM conectado',
        'error': 'Falha ao reescrever: {message}',
        'error.network': 'Não foi possível contactar o serviço — recarregue a página e tente novamente',
        'style.balanced': 'Equilibrado',
        'style.concise': 'Conciso',
        'style.detailed': 'Detalhado',
        'style.code': 'Orientado a código',
      },
      ru: {
        'title': 'Улучшить промпт с помощью подключённой LLM',
        'error': 'Не удалось улучшить промпт: {message}',
        'error.network': 'Сервис недоступен — перезагрузите страницу и повторите',
        'style.balanced': 'Сбалансированный',
        'style.concise': 'Краткий',
        'style.detailed': 'Подробный',
        'style.code': 'Для кода',
      },
      it: {
        'title': 'Riscrivi il prompt con il LLM connesso',
        'error': 'Riscrittura fallita: {message}',
        'error.network': 'Servizio non raggiungibile — ricarica la pagina e riprova',
        'style.balanced': 'Equilibrato',
        'style.concise': 'Conciso',
        'style.detailed': 'Dettagliato',
        'style.code': 'Orientato al codice',
      },
      tr: {
        'title': 'Bağlı LLM ile komut istemini yeniden yaz',
        'error': 'Komut istemi yeniden yazılamadı: {message}',
        'error.network': 'Hizmete ulaşılamadı — sayfayı yenileyip tekrar deneyin',
        'style.balanced': 'Dengeli',
        'style.concise': 'Kısa',
        'style.detailed': 'Ayrıntılı',
        'style.code': 'Kod odaklı',
      },
      vi: {
        'title': 'Viết lại lời nhắc qua LLM đã kết nối',
        'error': 'Không thể viết lại lời nhắc: {message}',
        'error.network': 'Không kết nối được dịch vụ — hãy tải lại trang và thử lại',
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

    /**
     * Resolve one icon across DSH generations. DSH 0.2 renamed the whole
     * primitives icon set from size suffixes (`IconXxx16` / `IconXxx14`) to
     * weight suffixes (`IconXxxRegular` / `IconXxxMedium`), so a hard-coded
     * name is `undefined` on the other side and React would fail to render.
     * Probing both keeps one bundle working on every supported runtime; a
     * miss degrades to no icon instead of a crash.
     */
    function pickIcon(candidates) {
      for (var i = 0; i < candidates.length; i++) {
        if (primitives[candidates[i]] != null) return primitives[candidates[i]];
      }
      return null;
    }

    var ICONS = {
      sparkle: pickIcon(['IconSparkleRegular', 'IconSparkleMedium', 'IconSparkle16']),
      loading: pickIcon(['IconLoadingOutlineRegular', 'IconLoadingOutlineMedium', 'IconLoadingOutline16']),
      edit: pickIcon(['IconEditOutlineRegular', 'IconEditOutlineMedium', 'IconEditOutline16']),
      checklist: pickIcon(['IconChecklistOutlineRegular', 'IconChecklistOutlineMedium', 'IconChecklistOutline14']),
      list: pickIcon(['IconListPenOutlineRegular', 'IconListPenOutlineMedium', 'IconListPenOutline16']),
      code: pickIcon(['IconCodeOutlineRegular', 'IconCodeOutlineMedium', 'IconCodeOutline16']),
    };

    /** Instantiate a resolved icon component, or null when unavailable. */
    function iconElement(key) {
      var Comp = ICONS[key];
      return Comp == null ? null : react.createElement(Comp, null);
    }

    /** Map a menu icon key to the primitives icon element. */
    function styleIcon(key) {
      switch (key) {
        case 'edit': return iconElement('edit');
        case 'checklist': return iconElement('checklist');
        case 'list': return iconElement('list');
        case 'code': return iconElement('code');
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
          // Browsers surface a failed/aborted fetch as a TypeError
          // ("Failed to fetch" / "NetworkError..." / "Load failed"); map it
          // to actionable localized copy instead of leaking the raw string.
          var message = err instanceof TypeError
            ? tr('error.network')
            : (err && err.message ? err.message : String(err));
          setError(message);
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
      var triggerIcon = busy ? iconElement('loading') : iconElement('sparkle');
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
