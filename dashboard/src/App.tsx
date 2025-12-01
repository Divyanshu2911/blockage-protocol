import { useEffect, useState } from 'react';
import { getProvider, getSeedContract, CONTRACTS } from './contracts';
import { Activity, Box, Hash, Clock, Trophy } from 'lucide-react';
import { ethers } from 'ethers';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import './App.css';

function App() {
  const [setupDone, setSetupDone] = useState(false);
  const [stake, setStake] = useState<number>(10);
  const [epoch, setEpoch] = useState<number>(0);
  const [seed, setSeed] = useState<string>("Waiting...");
  const [history, setHistory] = useState<{ epoch: number, seed: string, vrf: string, isWinner: boolean, val: number }[]>([]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  // Node Private Key (Injected via env for demo purposes)
  const NODE_KEY = import.meta.env.VITE_NODE_PRIVATE_KEY;

  useEffect(() => {
    if (!setupDone) return;

    const provider = getProvider();
    const contract = getSeedContract(provider);

    const update = async () => {
      try {
        const currentEpoch = Number(await contract.currentEpoch());

        setEpoch(prev => {
          // Detect reset
          if (currentEpoch < prev) {
            setHistory([]);
            setLastWin(null);
            return currentEpoch;
          }

          if (currentEpoch > prev) {
            // Fetch seed
            contract.currentSeed().then((currentSeed: string) => {
              setSeed(currentSeed);

              // Calculate VRF
              let vrfVal = "0x00";
              let win = false;
              let vrfNum = 0;

              if (NODE_KEY) {
                const wallet = new ethers.Wallet(NODE_KEY);
                const vrfInput = ethers.solidityPacked(["bytes32", "address"], [currentSeed, wallet.address]);
                const vrfOutput = ethers.keccak256(vrfInput);
                vrfVal = vrfOutput;

                // Normalize for graph (0-100)
                const vrfBig = BigInt(vrfOutput);
                vrfNum = Number(vrfBig % 100n);

                // Win if Randomness < Stake (Simple probability model)
                // Higher stake = Higher threshold = More winning area
                win = vrfNum < stake;
              }

              if (win) setLastWin(currentEpoch);

              setHistory(h => {
                if (h.some(item => item.epoch === currentEpoch)) return h;
                return [{
                  epoch: currentEpoch,
                  seed: currentSeed,
                  vrf: vrfVal,
                  isWinner: win,
                  val: vrfNum
                }, ...h].slice(0, 20);
              });
            });
            return currentEpoch;
          }
          return prev;
        });
      } catch (e) {
        console.error("Connection error:", e);
      }
    };

    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [setupDone, stake]); // Re-run logic if stake changes (for future epochs)

  // Reverse history for chart (oldest to newest)
  const chartData = [...history].reverse();

  if (!setupDone) {
    return (
      <div className="container setup-screen">
        <div className="card">
          <h1><Box className="icon" /> Welcome to Blockage</h1>
          <p>Enter your initial stake to join the network.</p>

          <div className="input-group">
            <label>Stake Amount (10-100)</label>
            <input
              type="number"
              min="10"
              max="100"
              value={stake}
              onChange={(e) => setStake(Math.max(10, Math.min(100, Number(e.target.value))))}
            />
          </div>

          <div className="input-group">
            <label>Role</label>
            <select style={{ padding: '0.75rem', borderRadius: '0.5rem', background: '#0f172a', color: 'white', border: '1px solid #334155' }} onChange={(e) => console.log("Role selected:", e.target.value)}>
              <option value="1">Sequencer (Block Producer)</option>
              <option value="2">Prover (ZK Worker)</option>
              <option value="3">Full Node (Both)</option>
            </select>
          </div>

          <button onClick={() => setSetupDone(true)}>Join Network</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1><Box className="icon" /> Blockage Protocol Dashboard</h1>
        <div className="status">
          <span className="live-indicator">● Live</span>
          <span>Local Devnet</span>
        </div>
      </header>

      <main>
        <div className="card hero">
          <div className="stat">
            <Clock className="icon-lg" />
            <div>
              <h3>Current Epoch</h3>
              <div className="value">{epoch}</div>
            </div>
          </div>
          <div className="stat">
            <Hash className="icon-lg" />
            <div>
              <h3>Current Seed</h3>
              <div className="value mono">{seed.substring(0, 10)}...</div>
            </div>
          </div>
          <div className="stat">
            <Trophy className={`icon-lg ${lastWin === epoch ? 'pulse-win' : ''}`} style={{ color: lastWin === epoch ? '#fbbf24' : '#475569' }} />
            <div>
              <h3>Last Win</h3>
              <div className="value">{lastWin ? `Epoch ${lastWin}` : 'None'}</div>
            </div>
          </div>
          <div className="stat control">
            <div>
              <h3>My Stake</h3>
              <div className="value">{stake}</div>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={stake}
              onChange={(e) => setStake(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="card">
          <h2><Activity className="icon" /> VRF Randomness (Last 20 Epochs)</h2>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <XAxis dataKey="epoch" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <ReferenceLine y={stake} stroke="#22c55e" strokeDasharray="3 3" label={{ value: `Win Threshold (< ${stake})`, fill: "#22c55e", fontSize: 10 }} />
                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CrowdProve Section */}
        <CrowdProveSection />

        <div className="card">
          <h2>Recent Epochs</h2>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.epoch} className={`history-item ${item.isWinner ? 'winner-row' : ''}`}>
                <span className="epoch-badge">Epoch {item.epoch}</span>
                <span className="seed-mono">{item.seed.substring(0, 12)}...</span>
                <span className="vrf-badge">
                  {item.isWinner ? "🏆 WINNER" : `VRF: ${item.val}`}
                </span>
              </div>
            ))}
            {history.length === 0 && <p className="empty">Waiting for blocks...</p>}
          </div>
        </div>

        <div className="card">
          <h2>Debug Info</h2>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto' }}>
            RPC: {CONTRACTS.RPC} (Proxied to 8545) <br />
            Registry: {CONTRACTS.REGISTRY} <br />
            Seed Contract: {CONTRACTS.SEED} <br />
            Node Key: {NODE_KEY ? "Loaded" : "Missing"} <br />
            Last Update: {new Date().toLocaleTimeString()}
          </pre>
        </div>
      </main>
    </div>
  );
}

// --- CrowdProve Components (Simulated for UI Demo) ---
import { Users, Server, CheckCircle, Clock as ClockIcon } from 'lucide-react';

function CrowdProveSection() {
  const [jobs, setJobs] = useState<{ id: string, status: 'pending' | 'assigned' | 'completed', worker?: string }[]>([]);
  const [workers, setWorkers] = useState<{ id: string, status: 'idle' | 'working' }[]>([
    { id: '0xEa53...65E0', status: 'idle' },
    { id: '0xA4A8...09Bf', status: 'idle' },
    { id: '0xBf6d...66b1', status: 'idle' },
  ]);

  // Simulate Job Creation & Processing
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Create new batch occasionally
      if (Math.random() > 0.7 && jobs.filter(j => j.status !== 'completed').length < 5) {
        const batchId = Math.floor(Math.random() * 1000);
        const newJobs = Array(3).fill(0).map((_, i) => ({
          id: `${batchId}-${i}`,
          status: 'pending' as const
        }));
        setJobs(prev => [...prev, ...newJobs].slice(-10)); // Keep last 10
      }

      // 2. Assign Jobs to Idle Workers
      setJobs(prev => {
        const next = [...prev];
        const pending = next.find(j => j.status === 'pending');
        if (pending) {
          const worker = workers.find(w => w.status === 'idle');
          if (worker) {
            pending.status = 'assigned';
            pending.worker = worker.id;
            setWorkers(ws => ws.map(w => w.id === worker.id ? { ...w, status: 'working' } : w));
          }
        }
        return next;
      });

      // 3. Complete Jobs
      setJobs(prev => {
        const next = [...prev];
        const assigned = next.filter(j => j.status === 'assigned');
        assigned.forEach(job => {
          if (Math.random() > 0.6) {
            job.status = 'completed';
            setWorkers(ws => ws.map(w => w.id === job.worker ? { ...w, status: 'idle' } : w));
          }
        });
        return next;
      });

    }, 1000);
    return () => clearInterval(interval);
  }, [jobs, workers]);

  return (
    <div className="card">
      <h2><Users className="icon" /> CrowdProve Network (Live)</h2>

      <div className="grid-2">
        {/* Worker Pool */}
        <div className="sub-card">
          <h3><Server className="icon-sm" /> Active Workers ({workers.length})</h3>
          <div className="worker-list">
            {workers.map(w => (
              <div key={w.id} className={`worker-item ${w.status}`}>
                <div className="worker-id">{w.id}</div>
                <div className="worker-status">
                  {w.status === 'working' ? <span className="badge working">Working</span> : <span className="badge idle">Idle</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Queue */}
        <div className="sub-card">
          <h3><ClockIcon className="icon-sm" /> Job Queue</h3>
          <div className="job-list">
            {jobs.slice().reverse().map(j => (
              <div key={j.id} className="job-item">
                <span className="job-id">Job #{j.id}</span>
                {j.status === 'pending' && <span className="badge pending">Pending</span>}
                {j.status === 'assigned' && <span className="badge assigned">Assigned to {j.worker?.slice(0, 6)}</span>}
                {j.status === 'completed' && <span className="badge completed"><CheckCircle size={12} /> Done</span>}
              </div>
            ))}
            {jobs.length === 0 && <div className="empty-text">No active jobs</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
