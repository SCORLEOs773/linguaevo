import { useState } from "react";
import { Plus, Trash2, Save, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Phoneme {
  symbol: string;
  category: "consonant" | "vowel";
}

interface Word {
  form: string;
  meaning: string;
}

interface SoundChangeRule {
  before: string;
  after: string;
  environment?: string;
}

const commonConsonants = [
  "p",
  "t",
  "k",
  "b",
  "d",
  "g",
  "m",
  "n",
  "s",
  "f",
  "h",
  "l",
  "r",
  "w",
  "j",
  "ʃ",
  "ŋ",
  "θ",
];
const commonVowels = ["a", "e", "i", "o", "u", "ɑ", "ɛ", "ɪ", "ɔ", "ʊ", "ə"];

function App() {
  const [langName, setLangName] = useState("ProtoLingua");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [evolvedWords, setEvolvedWords] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentVocabulary, setCurrentVocabulary] = useState<Word[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generations, setGenerations] = useState<any[]>([]); // array of evolution stages
  const [selectedGeneration, setSelectedGeneration] = useState<number>(0);
  const [isEvolving, setIsEvolving] = useState(false);
  const [phonemes, setPhonemes] = useState<Phoneme[]>([
    { symbol: "p", category: "consonant" },
    { symbol: "t", category: "consonant" },
    { symbol: "k", category: "consonant" },
    { symbol: "a", category: "vowel" },
    { symbol: "i", category: "vowel" },
  ]);
  const [vocabulary, setVocabulary] = useState<Word[]>([
    { form: "kata", meaning: "house" },
    { form: "pani", meaning: "water" },
    { form: "mira", meaning: "star" },
  ]);
  const [rules, setRules] = useState<SoundChangeRule[]>([
    { before: "p", after: "f", environment: "_V" },
  ]);

  const [newPhoneme, setNewPhoneme] = useState("");
  const [newPhonemeCat, setNewPhonemeCat] = useState<"consonant" | "vowel">(
    "consonant",
  );

  const [newWordForm, setNewWordForm] = useState("");
  const [newWordMeaning, setNewWordMeaning] = useState("");

  const [newRuleBefore, setNewRuleBefore] = useState("");
  const [newRuleAfter, setNewRuleAfter] = useState("");
  const [newRuleEnv, setNewRuleEnv] = useState("");

  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const addPhoneme = () => {
    if (!newPhoneme.trim()) return;
    if (phonemes.some((p) => p.symbol === newPhoneme.trim())) return;
    setPhonemes([
      ...phonemes,
      { symbol: newPhoneme.trim(), category: newPhonemeCat },
    ]);
    setNewPhoneme("");
  };

  const removePhoneme = (index: number) =>
    setPhonemes(phonemes.filter((_, i) => i !== index));

  const addWord = () => {
    if (!newWordForm.trim() || !newWordMeaning.trim()) return;
    setVocabulary([
      ...vocabulary,
      { form: newWordForm.trim(), meaning: newWordMeaning.trim() },
    ]);
    setNewWordForm("");
    setNewWordMeaning("");
  };

  const removeWord = (index: number) =>
    setVocabulary(vocabulary.filter((_, i) => i !== index));

  const addRule = () => {
    if (!newRuleBefore.trim() || !newRuleAfter.trim()) return;
    setRules([
      ...rules,
      {
        before: newRuleBefore.trim(),
        after: newRuleAfter.trim(),
        environment: newRuleEnv.trim() || undefined,
      },
    ]);
    setNewRuleBefore("");
    setNewRuleAfter("");
    setNewRuleEnv("");
  };

  const removeRule = (index: number) =>
    setRules(rules.filter((_, i) => i !== index));

  const saveProto = async () => {
    if (!langName.trim()) {
      setStatus("❌ Please give your language a name");
      return;
    }

    setIsSaving(true);
    const payload = { name: langName.trim(), phonemes, vocabulary, rules };

    try {
      const res = await fetch("http://localhost:8000/api/proto/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setStatus(`✅ ${data.message}`);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setStatus("❌ Could not reach backend. Is it running on port 8000?");
    } finally {
      setIsSaving(false);
    }
  };

  const evolveLanguage = async (continueFromCurrent: boolean = false) => {
    if (!langName.trim()) {
      setStatus("❌ Please save the proto-language first");
      return;
    }

    setIsEvolving(true);
    let vocabToUse = vocabulary;

    if (continueFromCurrent && generations.length > 0) {
      const latest = generations[generations.length - 1];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vocabToUse = latest.evolved_vocabulary.map((item: any) => ({
        form: item.evolved,
        meaning: item.meaning,
      }));
    }

    const payload = {
      name: langName.trim(),
      phonemes,
      vocabulary: vocabToUse,
      rules,
    };

    try {
      const res = await fetch("http://localhost:8000/api/proto/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.evolved_vocabulary) {
        const newGeneration = {
          generation: generations.length + 1,
          evolved_vocabulary: data.evolved_vocabulary,
          timestamp: new Date().toLocaleTimeString(),
        };

        const updatedGenerations = [...generations, newGeneration];
        setGenerations(updatedGenerations);
        setEvolvedWords(data.evolved_vocabulary);
        setSelectedGeneration(updatedGenerations.length - 1);

        setStatus(
          `✅ Generation ${newGeneration.generation} created successfully!`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setStatus("❌ Could not connect to evolution engine.");
    } finally {
      setIsEvolving(false);
    }
  };

  const resetEvolution = () => {
    setGenerations([]);
    setEvolvedWords([]);
    setSelectedGeneration(0);
    setStatus("Evolution tree reset. Ready for new simulation.");
  };

  const loadLatinExample = () => {
    // Latin phonemes
    setPhonemes([
      { symbol: "p", category: "consonant" },
      { symbol: "t", category: "consonant" },
      { symbol: "k", category: "consonant" },
      { symbol: "b", category: "consonant" },
      { symbol: "d", category: "consonant" },
      { symbol: "g", category: "consonant" },
      { symbol: "m", category: "consonant" },
      { symbol: "n", category: "consonant" },
      { symbol: "s", category: "consonant" },
      { symbol: "l", category: "consonant" },
      { symbol: "r", category: "consonant" },
      { symbol: "a", category: "vowel" },
      { symbol: "e", category: "vowel" },
      { symbol: "i", category: "vowel" },
      { symbol: "o", category: "vowel" },
      { symbol: "u", category: "vowel" },
    ]);

    // Famous Latin starter vocabulary (good for showing evolution)
    setVocabulary([
      { form: "pater", meaning: "father" },
      { form: "mater", meaning: "mother" },
      { form: "frater", meaning: "brother" },
      { form: "noctem", meaning: "night" },
      { form: "lactem", meaning: "milk" },
      { form: "cantare", meaning: "to sing" },
      { form: "caballum", meaning: "horse" },
      { form: "vinum", meaning: "wine" },
      { form: "aqua", meaning: "water" },
      { form: "domus", meaning: "house" },
    ]);

    // Realistic Latin sound changes (simplified but educational)
    setRules([
      { before: "p", after: "f", environment: "_V" }, // p → f before vowel (like in French)
      { before: "t", after: "d", environment: "V_" }, // intervocalic t → d
      { before: "k", after: "ʃ", environment: "_V" }, // k → sh/ch sound (like in French/Spanish)
      { before: "ct", after: "t", environment: "" }, // ct → t (noctem → nuit)
      { before: "gn", after: "ɲ", environment: "" }, // gn → ny sound
    ]);

    setLangName("Latin");
    setGenerations([]);
    setEvolvedWords([]);
    setSelectedGeneration(0);

    setStatus(
      "✅ Latin example loaded! Click 'Evolve 100 Years' to see it turn into Romance languages.",
    );
  };

  // Speak a word using browser TTS
  const speakWord = (word: string, isEvolved: boolean = false) => {
    if (!("speechSynthesis" in window)) {
      alert("Your browser doesn't support text-to-speech.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);

    // Make evolved version sound slightly different (older/future feel)
    if (isEvolved) {
      utterance.pitch = 1.1; // slightly higher pitch
      utterance.rate = 0.95; // slightly slower
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 1.05;
    }

    // Try to use a nice voice if available
    const voices = window.speechSynthesis.getVoices();
    const goodVoice = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.lang.startsWith("en"),
    );
    if (goodVoice) utterance.voice = goodVoice;

    window.speechSynthesis.speak(utterance);
  };

  const exportLanguage = () => {
    if (generations.length === 0) {
      setStatus("❌ Evolve the language at least once before exporting");
      return;
    }

    const exportData = {
      name: langName,
      phonemes: phonemes,
      rules: rules,
      generations: generations,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${langName.toLowerCase()}_linguaevo.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setStatus(`✅ Exported ${langName} language family successfully!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-slate-950 to-black overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(#22c55e_0.8px,transparent_1px)] bg-[length:50px_50px] opacity-10" />

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-500/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <span className="text-5xl">🌌</span>
            </div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
                LinguaEvo
              </h1>
              <p className="text-xl text-zinc-400 mt-1">
                Evolutionary Language Laboratory
              </p>
            </div>
          </div>
          <div className="text-emerald-400 text-sm font-mono">
            v0.1 • PROTO CREATOR
          </div>
        </motion.div>

        {/* Language Name */}
        <div className="mb-10">
          <label className="block text-zinc-400 text-sm mb-2 font-medium">
            LANGUAGE NAME
          </label>
          <input
            type="text"
            value={langName}
            onChange={(e) => setLangName(e.target.value)}
            className="w-full max-w-lg bg-zinc-900/70 backdrop-blur-xl border border-zinc-700 focus:border-emerald-500 rounded-3xl px-8 py-5 text-3xl font-light outline-none"
            placeholder="e.g. Eldari, Zenthari..."
          />
        </div>

        {/* Main Grid - Increased gap + better padding */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Phoneme Inventory */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔤</span>
              </div>
              <h2 className="text-3xl font-semibold text-white">
                Phoneme Inventory
              </h2>
            </div>

            <div className="flex flex-wrap gap-3 mb-10 min-h-[140px]">
              <AnimatePresence>
                {phonemes.map((ph, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="group bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 px-6 py-3 rounded-2xl flex items-center gap-4 transition-all"
                  >
                    <span className="text-3xl font-mono text-emerald-300">
                      {ph.symbol}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-zinc-500">
                      {ph.category}
                    </span>
                    <button
                      onClick={() => removePhoneme(i)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Phoneme (e.g. ʃ, ŋ, ə)"
                value={newPhoneme}
                onChange={(e) => setNewPhoneme(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPhoneme()}
                className="flex-1 bg-zinc-900/70 border border-zinc-700 focus:border-cyan-400 rounded-2xl px-6 py-4 text-lg outline-none"
              />
              <select
                value={newPhonemeCat}
                onChange={(e) =>
                  setNewPhonemeCat(e.target.value as "consonant" | "vowel")
                }
                className="bg-zinc-900/70 border border-zinc-700 rounded-2xl px-5 py-4 text-zinc-300"
              >
                <option value="consonant">Consonant</option>
                <option value="vowel">Vowel</option>
              </select>
              <button
                onClick={addPhoneme}
                className="bg-emerald-600 hover:bg-emerald-500 px-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 min-h-[56px] whitespace-nowrap"
              >
                <Plus size={24} />
              </button>
            </div>

            <div className="mt-6 text-xs text-zinc-500 flex flex-wrap gap-x-4">
              Quick:{" "}
              {[...commonConsonants, ...commonVowels].slice(0, 14).map((s) => (
                <button
                  key={s}
                  onClick={() => setNewPhoneme(s)}
                  className="hover:text-emerald-400 font-mono transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Starter Vocabulary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <h2 className="text-3xl font-semibold text-white">
                Starter Vocabulary
              </h2>
            </div>

            <div className="space-y-4 mb-10 max-h-80 overflow-y-auto pr-2 custom-scroll">
              <AnimatePresence>
                {vocabulary.map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-between items-center bg-zinc-900/70 border border-zinc-700 hover:border-cyan-500/30 px-6 py-4 rounded-2xl group"
                  >
                    <div className="flex-1">
                      <span className="font-mono text-2xl text-white">
                        {w.form}
                      </span>
                      <span className="ml-6 text-zinc-400">→ {w.meaning}</span>
                    </div>
                    <button
                      onClick={() => removeWord(i)}
                      className="text-red-400 hover:text-red-500 opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex gap-3">
              <input
                placeholder="Word (kata)"
                value={newWordForm}
                onChange={(e) => setNewWordForm(e.target.value)}
                className="flex-1 bg-zinc-900/70 border border-zinc-700 focus:border-cyan-400 rounded-2xl px-2 py-4 outline-none"
              />
              <input
                placeholder="Meaning (house)"
                value={newWordMeaning}
                onChange={(e) => setNewWordMeaning(e.target.value)}
                className="flex-1 bg-zinc-900/70 border border-zinc-700 focus:border-cyan-400 rounded-2xl px-2 py-4 outline-none"
              />
              <button
                onClick={addWord}
                className="bg-cyan-600 hover:bg-cyan-500 px-4 rounded-2xl flex items-center gap-3 transition-all active:scale-95 min-h-[56px]"
              >
                <Plus size={24} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sound Change Rules - More top margin */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
            <h2 className="text-3xl font-semibold text-white">
              Sound Change Rules
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            <AnimatePresence>
              {rules.map((rule, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-6 bg-zinc-900/70 border border-zinc-700 px-8 py-5 rounded-2xl group"
                >
                  <div className="font-mono text-2xl flex items-center gap-4">
                    <span className="text-orange-300">{rule.before}</span>
                    <span className="text-zinc-500">→</span>
                    <span className="text-emerald-300">{rule.after}</span>
                    {rule.environment && (
                      <span className="text-zinc-500 text-base">
                        / {rule.environment}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeRule(i)}
                    className="ml-auto text-red-400 hover:text-red-500 opacity-60 group-hover:opacity-100"
                  >
                    <Trash2 size={22} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-wrap gap-4">
            <input
              placeholder="Before"
              value={newRuleBefore}
              onChange={(e) => setNewRuleBefore(e.target.value)}
              className="w-32 bg-zinc-900/70 border border-zinc-700 focus:border-purple-400 rounded-2xl px-6 py-4 text-center font-mono text-xl"
            />
            <div className="flex items-center text-3xl text-zinc-600">→</div>
            <input
              placeholder="After"
              value={newRuleAfter}
              onChange={(e) => setNewRuleAfter(e.target.value)}
              className="w-32 bg-zinc-900/70 border border-zinc-700 focus:border-purple-400 rounded-2xl px-6 py-4 text-center font-mono text-xl"
            />
            <input
              placeholder="Environment (optional)"
              value={newRuleEnv}
              onChange={(e) => setNewRuleEnv(e.target.value)}
              className="flex-1 bg-zinc-900/70 border border-zinc-700 focus:border-purple-400 rounded-2xl px-6 py-4"
            />
            <button
              onClick={addRule}
              className="bg-purple-600 hover:bg-purple-500 px-10 rounded-2xl flex items-center gap-3 transition-all active:scale-95 min-h-[56px]"
            >
              <Plus size={24} /> Add Rule
            </button>
          </div>
          <p className="mt-4 text-xs text-zinc-500">
            Example: p → f / _V means "p becomes f before any vowel"
          </p>
        </motion.div>

        {/* Language Family Tree & Results - Final Version */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🌳</span>
              </div>
              <h2 className="text-3xl font-semibold text-white">
                Language Family Tree
              </h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetEvolution}
                className="text-red-400 hover:text-red-500 text-sm px-5 py-2 rounded-xl border border-red-900/50 hover:border-red-500 transition-all"
              >
                Reset Tree
              </button>
              <button
                onClick={exportLanguage}
                disabled={generations.length === 0}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-black px-6 py-2 rounded-xl text-sm font-medium transition-all"
              >
                Export Language
              </button>
            </div>
          </div>

          {/* Example Loader */}
          <div className="mb-6">
            <button
              onClick={loadLatinExample}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium transition-all active:scale-95"
            >
              📜 Load Latin → Romance Languages Example
            </button>
            <p className="text-xs text-zinc-500 text-center mt-2">
              See how real historical evolution works
            </p>
          </div>

          {/* Evolution Buttons */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => evolveLanguage(false)}
              disabled={isEvolving}
              className="flex-1 bg-amber-600 hover:bg-amber-500 disabled:opacity-70 px-10 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium transition-all active:scale-95"
            >
              <Play size={24} />
              {isEvolving ? "Evolving..." : "Evolve 100 Years (New Branch)"}
            </button>

            <button
              onClick={() => evolveLanguage(true)}
              disabled={isEvolving || generations.length === 0}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 px-10 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-medium transition-all active:scale-95"
            >
              {isEvolving ? "Evolving..." : "Evolve Current Branch"}
            </button>
          </div>

          {/* Generation Navigation */}
          {generations.length > 0 && (
            <div className="mb-8">
              <p className="text-zinc-400 mb-3 text-sm">Select Generation:</p>
              <div className="flex flex-wrap gap-2">
                {generations.map((gen, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedGeneration(index);
                      setEvolvedWords(gen.evolved_vocabulary);
                    }}
                    className={`px-6 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                      selectedGeneration === index
                        ? "bg-amber-600 text-black"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                  >
                    Gen {gen.generation}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Current Generation Display */}
          {evolvedWords.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl text-amber-400">
                Generation {selectedGeneration + 1} •{" "}
                {generations[selectedGeneration]?.timestamp || ""}
              </h3>

              <div className="grid grid-cols-1 gap-4">
                {evolvedWords.map((item, index) => (
                  <div
                    key={index}
                    className="bg-zinc-900/70 border border-amber-500/30 p-6 rounded-2xl flex justify-between items-center group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => speakWord(item.original, false)}
                          className="text-zinc-400 hover:text-white transition-colors text-2xl opacity-70 group-hover:opacity-100"
                          title="Hear original"
                        >
                          🔊
                        </button>
                        <span className="font-mono text-2xl line-through text-zinc-500">
                          {item.original}
                        </span>
                        <span className="text-amber-400 mx-3 text-xl">→</span>
                        <span className="font-mono text-2xl text-white">
                          {item.evolved}
                        </span>
                        <button
                          onClick={() => speakWord(item.evolved, true)}
                          className="text-amber-400 hover:text-amber-300 transition-colors text-2xl opacity-70 group-hover:opacity-100"
                          title="Hear evolved"
                        >
                          🔊
                        </button>
                      </div>
                    </div>
                    <span className="text-zinc-400 text-lg">
                      ({item.meaning})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {generations.length === 0 && (
            <div className="text-center py-20 text-zinc-500">
              <div className="text-6xl mb-4">🌱</div>
              <p className="text-xl">Your language family tree is empty</p>
              <p className="mt-2">
                Click "Evolve 100 Years" to begin simulation
              </p>
            </div>
          )}
        </motion.div>

        {/* Big Save Button */}
        <div className="flex justify-center mt-16">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={saveProto}
            disabled={isSaving}
            className="group relative bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold text-2xl px-16 py-6 rounded-3xl flex items-center gap-4 shadow-2xl shadow-emerald-500/30 transition-all disabled:opacity-70"
          >
            <Save
              size={32}
              className="group-hover:rotate-12 transition-transform"
            />
            {isSaving
              ? "Saving to Evolution Engine..."
              : "Save Proto-Language & Initialize"}
          </motion.button>
        </div>

        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 max-w-2xl mx-auto text-center text-lg font-medium bg-zinc-900/80 backdrop-blur-xl border border-emerald-900/50 p-6 rounded-3xl"
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
