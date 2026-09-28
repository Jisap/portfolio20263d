"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, GitFork, Users, Activity, Terminal } from "lucide-react";

interface GithubUser {
  name: string | null;
  login: string;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  html_url: string;
}

const FALLBACK_PROFILE: GithubUser = {
  name: "Jayanta Mondal",
  login: "JayantaCodes",
  avatar_url: "https://github.com/identicons/jayantacodes.png",
  bio: "Creative Developer building high-performance web experiences.",
  public_repos: 42,
  followers: 128,
  following: 30,
};

const FALLBACK_REPOS: GithubRepo[] = [
  { id: 1, name: "portfolio-os", description: "MacOS inspired web portfolio built with Next.js", stargazers_count: 56, forks_count: 12, language: "TypeScript", html_url: "#" },
  { id: 2, name: "glitch-engine", description: "WebGL based glitch effects library", stargazers_count: 34, forks_count: 5, language: "GLSL", html_url: "#" },
  { id: 3, name: "terminal-cv", description: "Interactive command-line resume", stargazers_count: 28, forks_count: 8, language: "Rust", html_url: "#" },
  { id: 4, name: "creative-ui", description: "A collection of avant-garde UI components", stargazers_count: 15, forks_count: 2, language: "React", html_url: "#" },
];

export default function GithubProfile() {
  // Contenido inmediato: se inicializa con fallback para que la tarjeta
  // nunca quede vacía (ni siquiera durante la carga o si la API falla).
  const [profile, setProfile] = useState<GithubUser>(FALLBACK_PROFILE);
  const [repos, setRepos] = useState<GithubRepo[]>(FALLBACK_REPOS);
  const [loading, setLoading] = useState(true);
  const username = "JayantaCodes";

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);
        if (!userRes.ok) throw new Error("User fetch failed");
        const userData = await userRes.json();

        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=4`);
        if (!reposRes.ok) throw new Error("Repos fetch failed");
        const reposData = await reposRes.json();

        if (!cancelled) {
          setProfile(userData);
          if (Array.isArray(reposData) && reposData.length > 0) {
            setRepos(reposData);
          }
        }
      } catch {
        // Se mantiene el contenido fallback: la tarjeta nunca queda vacía.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative w-full py-32 px-6 md:px-20 bg-[#0a0a0a] overflow-hidden border-t border-white/5">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-12">

          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
                <span className="text-[10px] font-mono text-accent uppercase tracking-[0.5em]">System_Live_Connection</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase">GitHub <span className="text-white/20 italic">Archive</span></h2>
            </div>
            <div className="flex items-center gap-8 font-mono text-[10px] text-white/30 tracking-widest uppercase">
              <div className="flex flex-col">
                <span className="text-white/60 text-lg font-bold">1.2K+</span>
                <span>Contributions</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/60 text-lg font-bold">140+</span>
                <span>Stars_Earned</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center lg:items-stretch"
          >
            {/* Profile Card */}
            <div className="w-full lg:col-span-4 bg-white/5 p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 rotate-3 group-hover:rotate-0 transition-transform duration-500 relative z-10 bg-white/5">
                    <img
                      src={profile.avatar_url}
                      alt={profile.name ?? profile.login}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_PROFILE.avatar_url;
                      }}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                  <div className="absolute -inset-2 border border-accent/20 rounded-3xl -rotate-3 group-hover:rotate-6 transition-transform duration-700" />
                </div>

                <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-tighter">{profile.name ?? profile.login}</h3>
                <p className="text-accent font-mono text-xs mb-6 tracking-widest uppercase opacity-70">@{profile.login}</p>

                <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-xs">
                  {profile.bio ?? "Creative Developer building high-performance web experiences."}
                </p>

                {loading && (
                  <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4 animate-pulse">
                    Syncing_Live_Data…
                  </p>
                )}

                <div className="grid grid-cols-3 gap-4 w-full pt-8 border-t border-white/5">
                  <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xl font-black text-white">{profile.public_repos}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Repositories</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-xl font-black text-white">{profile.followers}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Followers</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white/5 rounded-2xl border border-white/5">
                    <Users size={14} className="text-accent mb-1" />
                    <span className="text-xl font-black text-white">{profile.following}</span>
                    <span className="text-[8px] font-mono text-white/30 uppercase tracking-widest">Following</span>
                  </div>
                </div>

                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 w-full py-4 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-accent hover:text-black transition-all duration-300 group/btn active:scale-95"
                >
                  <Terminal size={18} />
                  <span className="uppercase tracking-widest text-xs">Open_Registry</span>
                </a>
              </div>
            </div>

            {/* Repositories */}
            <div className="w-full lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {repos.map((repo, idx) => (
                <motion.a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={repo.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-accent/40 transition-all duration-500 relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Activity size={16} className="text-accent animate-pulse" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 text-white/40 group-hover:text-accent transition-colors">
                        <Terminal size={14} />
                      </div>
                      <h4 className="text-xl font-black text-white tracking-tighter uppercase group-hover:text-accent transition-colors">{repo.name}</h4>
                    </div>
                    {repo.description?.trim() ? (
                      <p className="text-white/50 text-xs leading-relaxed mb-8 line-clamp-3 font-mono">{repo.description}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5 text-[10px] font-mono uppercase tracking-widest text-white/30">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-2 group-hover:text-white transition-colors"><Star size={12} className="text-accent" /> {repo.stargazers_count}</span>
                      <span className="flex items-center gap-2 group-hover:text-white transition-colors"><GitFork size={12} className="text-blue-400" /> {repo.forks_count}</span>
                    </div>
                    {repo.language ? (
                      <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5 group-hover:border-accent/20 transition-colors">
                        {repo.language}
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-white/20">
                        Code
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}