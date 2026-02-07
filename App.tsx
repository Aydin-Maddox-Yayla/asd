
import React, { useState } from 'react';
import { BotConfig, BotCommand, GenerationResult, BotPersonality } from './types';
import { generateBotCode } from './services/geminiService';

const PLATFORMS = ['Discord', 'Telegram', 'Slack', 'Twitch'] as const;
const LANGUAGES = ['JavaScript', 'TypeScript', 'Python'] as const;
const PERSONALITIES: BotPersonality[] = ['freundlich', 'formell', 'humorvoll', 'sarkastisch', 'minimalistisch'];

const App: React.FC = () => {
  const [config, setConfig] = useState<BotConfig>({
    name: 'MeinSuperBot',
    platform: 'Discord',
    personality: 'freundlich',
    interactionStyle: 'reaktiv (antwortet nur auf Befehle)',
    features: '',
    commands: [],
    language: 'JavaScript'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'code' | 'readme' | 'deps'>('code');

  const addCommand = () => {
    const newCommand: BotCommand = {
      id: Math.random().toString(36).substr(2, 9),
      trigger: '',
      description: '',
      action: ''
    };
    setConfig(prev => ({ ...prev, commands: [...prev.commands, newCommand] }));
  };

  const updateCommand = (id: string, field: keyof BotCommand, value: string) => {
    setConfig(prev => ({
      ...prev,
      commands: prev.commands.map(cmd => cmd.id === id ? { ...cmd, [field]: value } : cmd)
    }));
  };

  const removeCommand = (id: string) => {
    setConfig(prev => ({
      ...prev,
      commands: prev.commands.filter(cmd => cmd.id !== id)
    }));
  };

  const handleGenerate = async () => {
    if (!config.features) {
      setError("Bitte gib an, was der Bot machen soll.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateBotCode(config);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler bei der Generierung.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadProject = () => {
    if (!result) return;
    const ext = config.language === 'Python' ? 'py' : (config.language === 'TypeScript' ? 'ts' : 'js');
    downloadFile(result.code, `bot.${ext}`);
    downloadFile(result.readme, "README.md");
    const depFile = config.language === 'Python' ? 'requirements.txt' : 'package.json';
    downloadFile(result.packageJson, depFile);
  };

  return (
    <div className="min-h-screen pb-20 bg-[#0f172a] text-slate-200">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-8 px-4 mb-8 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform hover:scale-105 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">BotGenius <span className="text-indigo-500 font-light text-sm ml-1 uppercase">Pro</span></h1>
              <p className="text-slate-500 text-xs">Entwerfe deinen Bot-Charakter & lade den Code</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="flex space-x-4 text-sm font-medium">
              <a href="#designer" className="text-slate-400 hover:text-white transition-colors">Designer</a>
              <a href="#hosting" className="text-slate-400 hover:text-white transition-colors">Hosting</a>
            </nav>
          </div>
        </div>
      </header>

      <main id="designer" className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Configuration */}
        <section className="lg:col-span-5 space-y-6">
          {/* Section 1: Identity */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl hover:border-indigo-500/30 transition-all">
            <h2 className="text-lg font-bold mb-5 flex items-center text-white">
              <span className="bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs shadow-lg shadow-indigo-500/40">1</span>
              Bot-Identität & Charakter
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Bot Name</label>
                <input 
                  type="text" 
                  value={config.name}
                  onChange={e => setConfig({...config, name: e.target.value})}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="z.B. GuardianBot"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Plattform</label>
                  <select 
                    value={config.platform}
                    onChange={e => setConfig({...config, platform: e.target.value as any})}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Sprache</label>
                  <select 
                    value={config.language}
                    onChange={e => setConfig({...config, language: e.target.value as any})}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Persönlichkeit</label>
                  <select 
                    value={config.personality}
                    onChange={e => setConfig({...config, personality: e.target.value as any})}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    {PERSONALITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Interaktionsstil</label>
                  <select 
                    value={config.interactionStyle}
                    onChange={e => setConfig({...config, interactionStyle: e.target.value})}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="reaktiv (antwortet nur auf Befehle)">Reaktiv</option>
                    <option value="proaktiv (begrüßt neue User, sendet gelegentlich Status-Updates)">Proaktiv</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Tasks */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
            <h2 className="text-lg font-bold mb-5 flex items-center text-white">
              <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs shadow-lg shadow-purple-500/40">2</span>
              Bot-Aufgaben & Features
            </h2>
            <textarea 
              value={config.features}
              onChange={e => setConfig({...config, features: e.target.value})}
              className="w-full h-32 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none resize-none placeholder:text-slate-700"
              placeholder="Was ist die Hauptaufgabe? (z.B. Er soll Tickets erstellen, User verwarnen, Memes posten...)"
            />
          </div>

          {/* Section 3: Commands */}
          <div className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center text-white">
                <span className="bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs shadow-lg shadow-emerald-500/40">3</span>
                Befehle (Commands)
              </h2>
              <button 
                onClick={addCommand}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-bold active:scale-95"
              >
                + Neu
              </button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {config.commands.length === 0 && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-900/20">
                  Definiere spezifische Befehle
                </div>
              )}
              {config.commands.map((cmd) => (
                <div key={cmd.id} className="p-5 bg-slate-900/50 rounded-2xl border border-slate-700 relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <button 
                    onClick={() => removeCommand(cmd.id)}
                    className="absolute top-4 right-4 text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Trigger</label>
                      <input 
                        type="text" 
                        value={cmd.trigger}
                        onChange={e => updateCommand(cmd.id, 'trigger', e.target.value)}
                        placeholder="z.B. !hallo"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Zweck</label>
                      <input 
                        type="text" 
                        value={cmd.description}
                        onChange={e => updateCommand(cmd.id, 'description', e.target.value)}
                        placeholder="z.B. Begrüßt User"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">Aktion/Logik</label>
                    <input 
                      type="text" 
                      value={cmd.action}
                      onChange={e => updateCommand(cmd.id, 'action', e.target.value)}
                      placeholder="z.B. Schickt zufällige Begrüßung"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            disabled={isGenerating}
            onClick={handleGenerate}
            className={`w-full py-5 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center space-x-3 transform active:scale-[0.98] ${
              isGenerating
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-6 h-6 border-4 border-slate-500 border-t-white rounded-full animate-spin"></div>
                <span>Schmiede Code...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>INSTALL BOT (GENERIEREN)</span>
              </>
            )}
          </button>
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-2xl text-sm flex items-start">
              <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Right Column: Results & Hosting */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-slate-800/40 p-8 rounded-3xl border border-slate-700/50 backdrop-blur-sm shadow-xl flex flex-col min-h-[600px]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                <button 
                  onClick={() => setActiveTab('code')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'code' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Code
                </button>
                <button 
                  onClick={() => setActiveTab('readme')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'readme' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Doku
                </button>
                <button 
                  onClick={() => setActiveTab('deps')}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === 'deps' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Deps
                </button>
              </div>
              {result && (
                <button 
                  onClick={downloadProject}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center transition-all hover:scale-105"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PROJEKT LADEN
                </button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col">
              {result ? (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col flex-1 h-[400px]">
                   <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex space-x-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {activeTab === 'code' ? 'main_file' : (activeTab === 'readme' ? 'README.md' : 'dependencies')}
                      </span>
                   </div>
                   <div className="p-6 overflow-auto scrollbar-thin scrollbar-thumb-slate-700 flex-1 bg-[#0a0f1d]">
                      <pre className="text-sm text-indigo-200 code-font whitespace-pre-wrap">
                        {activeTab === 'code' ? result.code : (activeTab === 'readme' ? result.readme : result.packageJson)}
                      </pre>
                   </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center px-12">
                  <div className="w-24 h-24 bg-slate-900/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1V18.5" />
                    </svg>
                  </div>
                  <h3 className="text-slate-400 font-bold text-lg mb-2">Bereit für die Generierung</h3>
                  <p className="text-sm">Konfiguriere links deinen Bot und drücke den Button. Die KI schreibt den Code basierend auf deinen Wünschen!</p>
                </div>
              )}

              {/* Deployment Options Section */}
              <div id="hosting" className="mt-8">
                <h3 className="text-sm font-black text-slate-500 uppercase mb-4 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Gratis Hosting Empfehlungen
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/50 group hover:border-indigo-500 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">Glitch.com</span>
                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Top für Node.js</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Perfekt für Discord Bots. Code hochladen, .env Datei erstellen und dein Bot läuft 24/7 (mit Pinger).</p>
                    <a href="https://glitch.com" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 font-bold flex items-center hover:underline">
                      Zu Glitch <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/50 group hover:border-indigo-500 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">Replit.com</span>
                      <span className="bg-blue-500/10 text-blue-500 text-[10px] px-2 py-0.5 rounded-full font-bold">In-Browser IDE</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Schreibe und hoste direkt im Browser. Unterstützt Python & JS gleichermaßen gut.</p>
                    <a href="https://replit.com" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 font-bold flex items-center hover:underline">
                      Zu Replit <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-700/50 group hover:border-indigo-500 transition-all cursor-pointer shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">Railway.app</span>
                      <span className="bg-purple-500/10 text-purple-500 text-[10px] px-2 py-0.5 rounded-full font-bold">Profi-Features</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">Einfache Deployment-Pipline via GitHub. Stabiler Betrieb für größere Projekte.</p>
                    <a href="https://railway.app" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 font-bold flex items-center hover:underline">
                      Zu Railway <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </a>
                  </div>
                  <div className="bg-slate-900/80 p-5 rounded-2xl border border