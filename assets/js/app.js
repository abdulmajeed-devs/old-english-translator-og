(function () {
  "use strict";

  var STORAGE_HISTORY = "oldEnglishTranslatorHistory";
  var STORAGE_THEME = "oldEnglishTranslatorTheme";

  var state = {
    mode: "real",
    direction: "modern-to-old",
    youNumber: "singular"
  };

  var shortcuts = [
    "How are you?",
    "Who are you?",
    "I am good.",
    "You are good.",
    "He is strong.",
    "We are happy.",
    "They are wise.",
    "I love you.",
    "You love me.",
    "Where is the house?"
  ];

  var questionWords = {
    how: "hū",
    what: "hwæt",
    who: "hwā",
    where: "hwǣr",
    when: "hwænne",
    why: "hwȳ"
  };

  var demonstratives = {
    this: "þis",
    that: "þæt"
  };

  var adjectives = {
    good: "gōd",
    bad: "yfel",
    strong: "strang",
    young: "ġeong",
    old: "eald",
    happy: "blīþe",
    sad: "unrōt",
    wise: "wīs",
    brave: "cene",
    fair: "fæġer",
    dark: "deorc",
    bright: "beorht"
  };

  var nouns = {
    man: "mann",
    woman: "wīf",
    king: "cyning",
    queen: "cwēn",
    house: "hūs",
    home: "hām",
    day: "dæg",
    night: "niht",
    friend: "frēond",
    love: "lufu",
    sword: "sweord",
    shield: "scield",
    word: "word",
    book: "bōc",
    bread: "hlāf",
    water: "wæter"
  };

  var pronouns = {
    i: { subject: "ic", object: "mē", person: "first", number: "singular", label: "first-person singular" },
    you: { subjectSingular: "þū", subjectPlural: "ġē", objectSingular: "þē", objectPlural: "ēow", person: "second", number: "unknown", label: "second person" },
    he: { subject: "hē", object: "hine", person: "third", number: "singular", label: "third-person singular masculine" },
    she: { subject: "hēo", object: "hīe", person: "third", number: "singular", label: "third-person singular feminine" },
    it: { subject: "hit", object: "hit", person: "third", number: "singular", label: "third-person singular neuter" },
    we: { subject: "wē", object: "ūs", person: "first", number: "plural", label: "first-person plural" },
    they: { subject: "hīe", object: "hīe", person: "third", number: "plural", label: "third-person plural" },
    me: { object: "mē", person: "first", number: "singular", label: "first-person object" },
    him: { object: "hine", person: "third", number: "singular", label: "third-person masculine object" },
    her: { object: "hīe", person: "third", number: "singular", label: "third-person feminine object" },
    us: { object: "ūs", person: "first", number: "plural", label: "first-person plural object" },
    them: { object: "hīe", person: "third", number: "plural", label: "third-person plural object" }
  };

  var verbs = {
    love: {
      infinitive: "lufian",
      present: {
        firstSingular: "lufie",
        secondSingular: "lufast",
        thirdSingular: "lufaþ",
        plural: "lufiaþ"
      }
    },
    see: {
      infinitive: "sēon",
      present: {
        firstSingular: "sēo",
        secondSingular: "sihst",
        thirdSingular: "sihþ",
        plural: "sēoþ"
      }
    },
    know: {
      infinitive: "witan",
      present: {
        firstSingular: "wāt",
        secondSingular: "wāst",
        thirdSingular: "wāt",
        plural: "witon"
      }
    },
    speak: {
      infinitive: "sprecan",
      present: {
        firstSingular: "sprece",
        secondSingular: "spricst",
        thirdSingular: "spricþ",
        plural: "sprecaþ"
      }
    },
    give: {
      infinitive: "ġiefan",
      present: {
        firstSingular: "ġiefe",
        secondSingular: "ġiefst",
        thirdSingular: "ġiefþ",
        plural: "ġiefaþ"
      }
    }
  };

  var reverseWords = {
    "hū": "how",
    "hwā": "who",
    "hwæt": "what",
    "hwǣr": "where",
    "eom": "am",
    "eart": "are",
    "is": "is",
    "sind": "are",
    "ic": "I",
    "þū": "you",
    "ġē": "you",
    "hē": "he",
    "hēo": "she",
    "hit": "it",
    "wē": "we",
    "hīe": "they",
    "þē": "you",
    "ēow": "you",
    "mē": "me",
    "ūs": "us",
    "gōd": "good",
    "strang": "strong",
    "blīþe": "happy",
    "wīs": "wise",
    "þis": "this",
    "þæt": "that",
    "se": "the",
    "hūs": "house",
    "frēond": "friend",
    "cyning": "king",
    "lufie": "love",
    "lufast": "love",
    "lufaþ": "loves",
    "lufiaþ": "love"
  };

  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector));
  }

  function initTheme() {
    var saved = localStorage.getItem(STORAGE_THEME);
    var preferred = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", saved || preferred);
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    var next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_THEME, next);
    setStatus("Theme changed.");
  }

  function cleanInput(input) {
    return input
      .replace(/\bI'm\b/gi, "I am")
      .replace(/\byou're\b/gi, "you are")
      .replace(/\bit's\b/gi, "it is")
      .trim();
  }

  function tokenize(input) {
    var clean = cleanInput(input);
    var end = clean.match(/[?.!]$/);
    var words = clean.toLowerCase().replace(/[?.!,;:"]/g, "").split(/\s+/).filter(Boolean);
    return {
      original: input,
      words: words,
      punctuation: end ? end[0] : "."
    };
  }

  function parse(tokens) {
    var words = tokens.words;
    var first = words[0];

    if (!words.length) return { type: "empty", tokens: tokens };

    if (questionWords[first]) {
      return parseQuestion(words, tokens);
    }

    return parseStatement(words, tokens);
  }

  function parseQuestion(words, tokens) {
    var q = words[0];
    var verb = words[1];
    var subject = words[2];

    if (isBeVerb(verb) && subject) {
      return {
        type: "wh-be-question",
        questionWord: q,
        verb: verb,
        subject: subject,
        rest: words.slice(3),
        tokens: tokens
      };
    }

    return {
      type: "unknown",
      tokens: tokens,
      reason: "Only question-word + be verb + subject patterns are supported in this version."
    };
  }

  function parseStatement(words, tokens) {
    var subject = words[0];
    var verb = words[1];
    var rest = words.slice(2);

    if (isBeVerb(verb) && subject) {
      return {
        type: "subject-be-complement",
        subject: subject,
        verb: verb,
        complement: rest,
        tokens: tokens
      };
    }

    if (verbs[verb] && subject) {
      return {
        type: "subject-verb-object",
        subject: subject,
        verb: verb,
        object: rest,
        tokens: tokens
      };
    }

    return {
      type: "unknown",
      tokens: tokens,
      reason: "Supported patterns include be-verb statements, wh-questions, and simple subject + verb + object sentences."
    };
  }

  function isBeVerb(word) {
    return ["am", "are", "is", "be"].indexOf(word) !== -1;
  }

  function getSubjectInfo(word) {
    var info = pronouns[word];
    if (!info) return null;

    if (word === "you") {
      var plural = state.youNumber === "plural";
      return {
        modern: word,
        old: plural ? info.subjectPlural : info.subjectSingular,
        object: plural ? info.objectPlural : info.objectSingular,
        person: "second",
        number: plural ? "plural" : "singular",
        label: plural ? "second-person plural" : "second-person singular"
      };
    }

    return {
      modern: word,
      old: info.subject,
      object: info.object,
      person: info.person,
      number: info.number,
      label: info.label
    };
  }

  function getSubjectPhraseInfo(words) {
    var first = words[0];
    var pronoun = getSubjectInfo(first);
    if (pronoun && words.length === 1) return pronoun;

    if (demonstratives[first] && words.length === 1) {
      return {
        modern: first,
        old: demonstratives[first],
        person: "third",
        number: "singular",
        label: "third-person singular demonstrative"
      };
    }

    if (first === "the" && nouns[words[1]]) {
      return {
        modern: words.join(" "),
        old: "se " + nouns[words[1]],
        person: "third",
        number: "singular",
        label: "third-person singular noun phrase"
      };
    }

    if (nouns[first] && words.length === 1) {
      return {
        modern: first,
        old: nouns[first],
        person: "third",
        number: "singular",
        label: "third-person singular noun"
      };
    }

    return null;
  }

  function getObjectInfo(word) {
    if (word === "you") {
      return {
        modern: "you",
        old: state.youNumber === "plural" ? "ēow" : "þē",
        label: state.youNumber === "plural" ? "object plural you" : "object singular you"
      };
    }

    if (pronouns[word] && pronouns[word].object) {
      return {
        modern: word,
        old: pronouns[word].object,
        label: pronouns[word].label
      };
    }

    return null;
  }

  function getBeVerb(subject) {
    if (!subject) return "";
    if (subject.number === "singular" && subject.person === "first") return "eom";
    if (subject.number === "singular" && subject.person === "second") return "eart";
    if (subject.number === "singular" && subject.person === "third") return "is";
    return "sind";
  }

  function getVerbForm(verb, subject) {
    var data = verbs[verb];
    if (!data || !subject) return "";
    if (subject.number === "plural") return data.present.plural;
    if (subject.person === "first") return data.present.firstSingular;
    if (subject.person === "second") return data.present.secondSingular;
    return data.present.thirdSingular;
  }

  function translateComplement(words, warnings, explanation) {
    return words.map(function (word) {
      if (adjectives[word]) {
        explanation.push(adjectives[word] + " = " + word + " adjective.");
        return adjectives[word];
      }
      if (nouns[word]) {
        explanation.push(nouns[word] + " = " + word + " noun.");
        return nouns[word];
      }
      if (demonstratives[word]) {
        explanation.push(demonstratives[word] + " = " + word + ".");
        return demonstratives[word];
      }
      if (word === "the") return "se";
      warnings.push("Unknown word: " + word);
      return "[" + word + "]";
    });
  }

  function applyGrammar(parsed) {
    if (state.mode === "shakespeare") return translateShakespeare(parsed.tokens.original);

    var explanation = [];
    var warnings = [];
    var output = "";

    if (parsed.type === "wh-be-question") {
      var qWord = questionWords[parsed.questionWord];
      var subject = getSubjectPhraseInfo([parsed.subject].concat(parsed.rest || []));
      if (!qWord || !subject) return unknownResult(parsed, "Unknown question word or subject.");
      var beVerb = getBeVerb(subject);
      output = capitalize(qWord) + " " + beVerb + " " + subject.old + "?";
      explanation.push(qWord + " = " + parsed.questionWord + ".");
      explanation.push(beVerb + " = " + parsed.verb + ", selected for " + subject.label + ".");
      explanation.push(subject.old + " = " + subject.modern + " as subject.");
      addYouNote(subject, explanation);
      return result(output, explanation, warnings);
    }

    if (parsed.type === "subject-be-complement") {
      var beSubject = getSubjectInfo(parsed.subject);
      if (!beSubject) return unknownResult(parsed, "Unknown subject.");
      var oldBe = getBeVerb(beSubject);
      var complement = translateComplement(parsed.complement, warnings, explanation);
      output = capitalize(beSubject.old) + " " + oldBe + (complement.length ? " " + complement.join(" ") : "") + ".";
      explanation.unshift(oldBe + " = " + parsed.verb + ", selected for " + beSubject.label + ".");
      explanation.unshift(beSubject.old + " = " + parsed.subject + " as subject.");
      addYouNote(beSubject, explanation);
      return result(output, explanation, warnings);
    }

    if (parsed.type === "subject-verb-object") {
      var verbSubject = getSubjectInfo(parsed.subject);
      if (!verbSubject) return unknownResult(parsed, "Unknown subject.");
      var oldVerb = getVerbForm(parsed.verb, verbSubject);
      var objectWords = parsed.object.map(function (word) {
        var objectInfo = getObjectInfo(word);
        if (objectInfo) {
          explanation.push(objectInfo.old + " = " + word + " as object.");
          return objectInfo.old;
        }
        if (nouns[word]) {
          explanation.push(nouns[word] + " = " + word + " noun.");
          return nouns[word];
        }
        if (word === "the") return "þone";
        warnings.push("Unknown word: " + word);
        return "[" + word + "]";
      });
      output = capitalize(verbSubject.old) + " " + oldVerb + (objectWords.length ? " " + objectWords.join(" ") : "") + ".";
      explanation.unshift(oldVerb + " = " + parsed.verb + ", present-tense form for " + verbSubject.label + ".");
      explanation.unshift(verbSubject.old + " = " + parsed.subject + " as subject.");
      addYouNote(verbSubject, explanation);
      return result(output, explanation, warnings);
    }

    return unknownResult(parsed, parsed.reason || "Pattern not supported.");
  }

  function translateShakespeare(input) {
    var text = cleanInput(input)
      .replace(/\bhow are you\b/gi, "How art thou")
      .replace(/\bwho are you\b/gi, "Who art thou")
      .replace(/\byou are\b/gi, "thou art")
      .replace(/\byou love me\b/gi, "thou lovest me")
      .replace(/\bi love you\b/gi, "I love thee")
      .replace(/\byou\b/gi, "thou")
      .replace(/\byour\b/gi, "thy")
      .replace(/\bare\b/gi, "art")
      .replace(/\bhas\b/gi, "hath")
      .replace(/\bdo\b/gi, "dost");

    return result(ensurePunctuation(text), ["Shakespeare mode uses Early Modern style, not real Old English."], []);
  }

  function unknownResult(parsed, message) {
    var words = parsed.tokens.words.map(function (word) {
      if (nouns[word]) return nouns[word];
      if (adjectives[word]) return adjectives[word];
      if (questionWords[word]) return questionWords[word];
      if (word === "the") return "se";
      var subject = getSubjectInfo(word);
      if (subject) return subject.old;
      return "[" + word + "]";
    });

    return result(capitalize(words.join(" ")) + ".", [message], ["Unsupported or unknown words are shown in brackets."]);
  }

  function result(output, explanation, warnings) {
    return {
      output: output,
      explanation: explanation,
      warnings: warnings
    };
  }

  function addYouNote(subject, explanation) {
    if (subject && subject.modern === "you") {
      explanation.push("Modern you was treated as " + subject.number + ": " + subject.old + ".");
    }
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  function ensurePunctuation(text) {
    if (/[?.!]$/.test(text)) return text;
    return text + ".";
  }

  function translateModern(text) {
    var parsed = parse(tokenize(text));
    return applyGrammar(parsed);
  }

  function translateOldToModern(text) {
    var warnings = [];
    var words = text.toLowerCase().replace(/[?.!,;:"]/g, "").split(/\s+/).filter(Boolean);
    var modern = words.map(function (word) {
      if (reverseWords[word]) return reverseWords[word];
      warnings.push("Unknown Old English word: " + word);
      return "[" + word + "]";
    });
    var ending = /\?$/.test(text.trim()) ? "?" : ".";
    return result(capitalize(modern.join(" ")) + ending, ["Reverse mode uses a small Old English glossary."], warnings);
  }

  function translateNow() {
    var input = $("#inputText");
    var output = $("#outputText");
    if (!input || !output) return;

    if (!input.value.trim()) {
      output.value = "";
      renderGrammar(null);
      updateCounters();
      setStatus("Enter text to translate.");
      return;
    }

    var translated = state.direction === "old-to-modern" ? translateOldToModern(input.value) : translateModern(input.value);
    output.value = translated.output;
    renderGrammar(translated);
    updateCounters();
    saveHistory(input.value, translated.output, translated);
    setStatus("Translation completed.");
  }

  function renderGrammar(data) {
    var box = $("#grammarBox");
    if (!box) return;

    if (!data) {
      box.innerHTML = "<h3>Grammar explanation</h3><p>Translation notes will appear here.</p>";
      return;
    }

    var explanation = data.explanation.length
      ? "<ul>" + data.explanation.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>"
      : "<p>No grammar notes for this result.</p>";

    var warnings = data.warnings.length
      ? "<div class=\"warning-box\"><strong>Warnings</strong><ul>" + data.warnings.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul></div>"
      : "<p class=\"small-note\">Simplified rule-based Old English. Case, gender, and full declension are limited.</p>";

    box.innerHTML = "<h3>Grammar explanation</h3>" + explanation + warnings;
  }

  function updateCounters() {
    var input = $("#inputText");
    var output = $("#outputText");
    var inputCounter = $("#inputCounter");
    var outputCounter = $("#outputCounter");
    if (input && inputCounter) inputCounter.textContent = countWords(input.value) + " words / " + input.value.length + " chars";
    if (output && outputCounter) outputCounter.textContent = countWords(output.value) + " words / " + output.value.length + " chars";
  }

  function countWords(text) {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }

  function setStatus(message) {
    var status = $("#statusText");
    if (status) status.textContent = message || "";
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_HISTORY) || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveHistory(input, output, details) {
    var history = getHistory();
    history.unshift({
      input: input,
      output: output,
      mode: state.mode,
      direction: state.direction,
      youNumber: state.youNumber,
      explanation: details && details.explanation ? details.explanation : [],
      warnings: details && details.warnings ? details.warnings : [],
      date: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history.slice(0, 50)));
    renderHistory();
  }

  function renderHistory() {
    var list = $("#historyList");
    if (!list) return;
    var history = getHistory();
    if (!history.length) {
      list.innerHTML = "<p>No saved translations yet.</p>";
      return;
    }
    list.innerHTML = "";
    history.forEach(function (item, index) {
      var row = document.createElement("div");
      row.className = "history-item";
      row.innerHTML =
        "<p><strong>" + escapeHtml(item.mode || "real") + "</strong> - " + escapeHtml(item.direction) + "</p>" +
        "<p>" + escapeHtml(item.input.slice(0, 180)) + "</p>" +
        "<p><strong>Result:</strong> " + escapeHtml(item.output.slice(0, 220)) + "</p>" +
        "<div class=\"history-actions\">" +
        "<button class=\"action-btn\" data-history-use=\"" + index + "\">Use</button>" +
        "<button class=\"action-btn\" data-history-copy=\"" + index + "\">Copy</button>" +
        "<button class=\"action-btn\" data-history-delete=\"" + index + "\">Delete</button>" +
        "</div>";
      list.appendChild(row);
    });
  }

  function copyText(text) {
    if (!text) {
      setStatus("Nothing to copy.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus("Copied to clipboard.");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var temp = document.createElement("textarea");
    temp.value = text;
    temp.setAttribute("readonly", "");
    temp.style.position = "fixed";
    temp.style.left = "-9999px";
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand("copy");
      setStatus("Copied to clipboard.");
    } catch (error) {
      setStatus("Copy is not available.");
    }
    document.body.removeChild(temp);
  }

  function downloadText() {
    var output = $("#outputText");
    var grammar = $("#grammarBox");
    if (!output || !output.value.trim()) {
      setStatus("Nothing to download.");
      return;
    }
    var content = "Translation:\n" + output.value + "\n\nGrammar:\n" + (grammar ? grammar.innerText : "");
    var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "old-english-translation.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setStatus("TXT download created.");
  }

  function pasteInput() {
    var input = $("#inputText");
    if (!input || !navigator.clipboard || !navigator.clipboard.readText) {
      setStatus("Paste is not available.");
      return;
    }
    navigator.clipboard.readText().then(function (text) {
      input.value = text;
      updateCounters();
      setStatus("Pasted clipboard text.");
    }).catch(function () {
      setStatus("Browser blocked clipboard paste.");
    });
  }

  function clearTool() {
    var input = $("#inputText");
    var output = $("#outputText");
    if (input) input.value = "";
    if (output) output.value = "";
    renderGrammar(null);
    updateCounters();
    setStatus("Translator cleared.");
  }

  function swapText() {
    var input = $("#inputText");
    var output = $("#outputText");
    if (!input || !output) return;
    var currentInput = input.value;
    input.value = output.value;
    output.value = currentInput;
    state.direction = state.direction === "modern-to-old" ? "old-to-modern" : "modern-to-old";
    updateDirectionUI();
    updateCounters();
    setStatus("Input and output swapped.");
  }

  function updateDirectionUI() {
    var direction = $("#directionSelect");
    var inputLabel = $("#inputLabel");
    var outputLabel = $("#outputLabel");
    if (direction) direction.value = state.direction;
    if (inputLabel) inputLabel.textContent = state.direction === "modern-to-old" ? "Modern English" : "Old English";
    if (outputLabel) outputLabel.textContent = state.direction === "modern-to-old" ? "Old English" : "Modern English";
  }

  function renderShortcuts() {
    var row = $("#shortcutRow");
    if (!row) return;
    row.innerHTML = "";
    shortcuts.forEach(function (text) {
      var button = document.createElement("button");
      button.className = "shortcut-btn";
      button.type = "button";
      button.textContent = text;
      button.addEventListener("click", function () {
        $("#inputText").value = text;
        updateCounters();
        translateNow();
      });
      row.appendChild(button);
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initTranslator() {
    if (!$("#inputText")) return;

    renderShortcuts();
    renderHistory();
    renderGrammar(null);
    updateCounters();
    updateDirectionUI();
    setStatus("Real Old English mode uses grammar rules before dictionary lookup.");

    $("#inputText").addEventListener("input", updateCounters);
    $("#translateBtn").addEventListener("click", translateNow);
    $("#clearBtn").addEventListener("click", clearTool);
    $("#copyBtn").addEventListener("click", function () { copyText($("#outputText").value); });
    $("#pasteBtn").addEventListener("click", pasteInput);
    $("#downloadBtn").addEventListener("click", downloadText);
    $("#swapBtn").addEventListener("click", swapText);
    $("#historyToggle").addEventListener("click", function () { $("#historyPanel").classList.toggle("open"); });
    $("#clearHistoryBtn").addEventListener("click", function () {
      localStorage.removeItem(STORAGE_HISTORY);
      renderHistory();
      setStatus("History cleared.");
    });

    $("#modeSelect").addEventListener("change", function (event) {
      state.mode = event.target.value;
      setStatus(state.mode === "real" ? "Real Old English grammar mode selected." : "Shakespeare style mode selected.");
    });
    $("#youMode").addEventListener("change", function (event) {
      state.youNumber = event.target.value;
      setStatus(state.youNumber === "plural" ? "You will translate as plural ġē." : "You will translate as singular þū.");
    });
    $("#directionSelect").addEventListener("change", function (event) {
      state.direction = event.target.value;
      updateDirectionUI();
      setStatus("Direction changed.");
    });

    document.addEventListener("click", function (event) {
      var use = event.target.closest("[data-history-use]");
      var copy = event.target.closest("[data-history-copy]");
      var del = event.target.closest("[data-history-delete]");

      if (use) {
        var item = getHistory()[Number(use.getAttribute("data-history-use"))];
        if (item) {
          $("#inputText").value = item.input;
          $("#outputText").value = item.output;
          renderGrammar({ explanation: item.explanation || [], warnings: item.warnings || [] });
          updateCounters();
          setStatus("History item loaded.");
        }
      }
      if (copy) {
        var copyItem = getHistory()[Number(copy.getAttribute("data-history-copy"))];
        if (copyItem) copyText(copyItem.output);
      }
      if (del) {
        var index = Number(del.getAttribute("data-history-delete"));
        var history = getHistory();
        history.splice(index, 1);
        localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
        renderHistory();
        setStatus("History item deleted.");
      }
    });
  }

  function initNavigation() {
    initTheme();
    var menu = $("#menuToggle");
    var nav = $("#mainNav");
    if (menu && nav) {
      menu.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        menu.setAttribute("aria-expanded", String(open));
      });
    }
    var theme = $("#themeToggle");
    if (theme) theme.addEventListener("click", toggleTheme);
  }

  function initContactForm() {
    var form = $("#contactForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = $("#contactName").value.trim();
      var email = $("#contactEmail").value.trim();
      var message = $("#contactMessage").value.trim();
      var subject = encodeURIComponent("Old English Translator contact request");
      var body = encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message);
      window.location.href = "mailto:contact@translatetooldenglish.com?subject=" + subject + "&body=" + body;
    });
  }

  function getFaqGroups() {
    var path = window.location.pathname;
    if (path.indexOf("about") !== -1) {
      return [
        [
          ["What is this translator built for?", "It is built for practical Old English translation with grammar notes, examples, and a clear distinction between real Old English and Shakespeare-style English."],
          ["Is the tool only for students?", "No. Writers, students, game creators, role-playing groups, and casual users can use it for short historical English drafts."],
          ["Does it replace an expert?", "No. It is a helpful rule-based tool, but important academic or permanent text should be reviewed by a specialist."]
        ]
      ];
    }
    if (path.indexOf("contact") !== -1) {
      return [
        [
          ["What should I include in feedback?", "Include your input text, selected mode, result, and the correction you expected."],
          ["Can I suggest new words?", "Yes. Send the modern word, suggested Old English form, and any source or context you have."],
          ["Does the form submit directly?", "No. It opens your email app so you can review the message before sending."]
        ]
      ];
    }
    if (path.indexOf("privacy") !== -1) {
      return [
        [
          ["Is translation history private?", "History is saved in your browser local storage and can be cleared from the tool or browser settings."],
          ["Do I need an account?", "No. The translator does not require a login or account."],
          ["Does the contact form send automatically?", "No. It opens an email draft and sends only if you choose to send it."]
        ]
      ];
    }
    return [
      [
        ["Is this real Old English?", "Real Old English mode uses grammar templates, pronouns, be-verb rules, and a small Old English vocabulary instead of simple word replacement."],
        ["Why does 'you are' become 'þū eart'?", "Þū is singular subject you, so the correct present be-verb is eart, not plural sind."],
        ["Can I choose plural you?", "Yes. Select plural you to translate modern you as ġē for subject and ēow for object."]
      ],
      [
        ["What sentence types work best?", "Short patterns work best, such as How are you, I am good, You are strong, I love you, and Where is the house."],
        ["What happens to unknown words?", "Unknown words are shown in brackets so the translator does not fake a meaning."],
        ["Can I download the result?", "Yes. Use Download TXT to save the translation and grammar notes."]
      ],
      [
        ["Is Shakespearean English Old English?", "No. Shakespearean English is Early Modern English, so it has a separate mode."],
        ["Can I translate Old English back to modern English?", "Yes, reverse mode uses a small glossary for common Old English words and forms."],
        ["Is this good for tattoos?", "Use it for ideas only. Permanent text should be checked by an Old English specialist."]
      ]
    ];
  }

  function initInlineFaqs() {
    var paragraphs = $all(".hero-lead, .seo-content > p, .page-card > p, .page-card .contact-grid > div > p");
    if (!paragraphs.length) return;

    var groups = getFaqGroups();
    paragraphs.forEach(function (paragraph, index) {
      if (paragraph.nextElementSibling && paragraph.nextElementSibling.classList.contains("inline-faqs")) return;

      var faqSet = groups[index % groups.length].slice(0, 3);
      var box = document.createElement("div");
      box.className = "inline-faqs";
      box.setAttribute("aria-label", "Common FAQs");
      box.innerHTML = "<h3>Common FAQs</h3>" + faqSet.map(function (item) {
        return "<details><summary>" + escapeHtml(item[0]) + "</summary><p>" + escapeHtml(item[1]) + "</p></details>";
      }).join("");
      paragraph.insertAdjacentElement("afterend", box);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initInlineFaqs();
    initTranslator();
    initContactForm();
  });
})();
