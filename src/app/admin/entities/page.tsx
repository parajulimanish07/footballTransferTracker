'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Layers, ShieldCheck, Cpu } from 'lucide-react';
import type { EntitySyncRun, EntityFreshness } from '@/lib/entities/entity-types';

export default function AdminEntitiesPage() {
  const [provider, setProvider] = useState<string>('loading...');
  const [freshness, setFreshness] = useState<EntityFreshness | null>(null);
  const [recentRuns, setRecentRuns] = useState<EntitySyncRun[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/admin/entities/sync');
      if (res.ok) {
        const data = await res.json();
        setProvider(data.provider);
        setFreshness(data.freshness);
        setRecentRuns(data.recentRuns || []);
      }
    } catch {
      setMessage('Failed to fetch provider status');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSync = async (syncType: 'leagues' | 'teams' | 'squad', targetId?: string) => {
    setIsSyncing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/entities/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType, targetId: targetId || 'premier-league' }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Sync ${syncType} completed successfully (${data.run?.updatedCount} entities updated)`);
        fetchStatus();
      } else {
        setMessage(`Sync failed: ${data.error}`);
      }
    } catch (err: any) {
      setMessage(`Error initiating sync: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-sky-400" />
            <h1 className="text-3xl font-extrabold tracking-tight">Football Entity Catalogue</h1>
          </div>
          <p className="text-slate-400 mt-1 text-sm">
            Cached canonical reference data for supported leagues, clubs, and player squads.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400 block">Active Provider</span>
            <span className="font-semibold uppercase text-emerald-300">{provider}</span>
          </div>
        </div>
      </header>

      {message && (
        <div className="p-4 bg-sky-950/60 border border-sky-800 text-sky-200 text-sm rounded-lg flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Sync Action Controls */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <Layers className="w-6 h-6 text-sky-400" />
            <h2 className="font-bold text-lg">Supported Leagues Sync</h2>
          </div>
          <p className="text-xs text-slate-400">
            Synchronizes competition definitions for Premier League, La Liga, Serie A, etc.
          </p>
          <button
            onClick={() => handleSync('leagues')}
            disabled={isSyncing}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync All Supported Leagues
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h2 className="font-bold text-lg">Premier League Teams</h2>
          </div>
          <p className="text-xs text-slate-400">
            Upserts club definitions, aliases, and crest metadata for Premier League teams.
          </p>
          <button
            onClick={() => handleSync('teams', 'premier-league')}
            disabled={isSyncing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Premier League Clubs
          </button>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-emerald-400" />
            <h2 className="font-bold text-lg">Man City Squad</h2>
          </div>
          <p className="text-xs text-slate-400">
            Updates player squad membership and position records for Manchester City.
          </p>
          <button
            onClick={() => handleSync('squad', 'manchester-city')}
            disabled={isSyncing}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Man City Squad
          </button>
        </div>
      </section>

      {/* Sync Telemetry History */}
      <section className="bg-slate-900/80 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Sync Telemetry History</h2>
          <span className="text-xs text-slate-400">
            Last Synced: {freshness?.lastSyncedAt ? new Date(freshness.lastSyncedAt).toLocaleString() : 'Never'}
          </span>
        </div>

        {recentRuns.length === 0 ? (
          <p className="text-slate-500 text-sm py-4">No recent sync runs recorded in current session.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4">Run ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Provider</th>
                  <th className="py-3 px-4">Target</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4">Errors</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-xs text-slate-300">{r.id}</td>
                    <td className="py-3 px-4 capitalize">{r.syncType}</td>
                    <td className="py-3 px-4 uppercase text-xs text-slate-400">{r.provider}</td>
                    <td className="py-3 px-4 text-xs text-slate-300">{r.targetId || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                        r.status === 'completed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        r.status === 'failed' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{r.updatedCount}</td>
                    <td className="py-3 px-4 text-rose-400">{r.errorCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
