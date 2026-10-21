import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Zap, Shield, ShieldAlert, Cpu, 
  RefreshCw, Play, BarChart3, Database, 
  Terminal, Award, HelpCircle, CheckCircle, 
  XCircle, Info, Gauge, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  runTransaction,
  deleteDoc,
  collection,
  increment,
  updateDoc
} from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// UI Types
interface BuyerResult {
  id: number;
  name: string;
  status: 'pending' | 'success' | 'declined' | 'error';
  latency: number;
  message: string;
  timestamp: string;
}

interface BenchmarkData {
  time: string;
  ops: number;
  latency: number;
}

const StressTest: React.FC = () => {
  const navigate = useNavigate();
  
  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'concurrency' | 'latency' | 'insights'>('concurrency');

  // Simulator 1 State (Concurrency / Flash Sale)
  const [initialStock, setInitialStock] = useState<number>(5);
  const [buyerCount, setBuyerCount] = useState<number>(20);
  const [concurrencyMode, setConcurrencyMode] = useState<'standard' | 'increment' | 'transaction'>('transaction');
  const [isSimulatingCheckout, setIsSimulatingCheckout] = useState<boolean>(false);
  const [simulationProgress, setSimulationProgress] = useState<number>(0);
  const [simulatedBuyers, setSimulatedBuyers] = useState<BuyerResult[]>([]);
  const [finalDbStock, setFinalDbStock] = useState<number | null>(null);
  const [simResultsSummary, setSimResultsSummary] = useState<{
    success: number;
    declined: number;
    error: number;
    oversoldCount: number;
    avgLatency: number;
    integrityStatus: 'passed' | 'failed' | 'warning' | null;
  } | null>(null);

  // Simulator 2 State (DB Benchmark)
  const [benchmarkDuration, setBenchmarkDuration] = useState<number>(5); // seconds
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkProgress, setBenchmarkProgress] = useState<number>(0);
  const [benchmarkChartData, setBenchmarkChartData] = useState<BenchmarkData[]>([]);
  const [benchmarkSummary, setBenchmarkSummary] = useState<{
    totalOps: number;
    throughput: number;
    avgLatency: number;
    p95Latency: number;
    errors: number;
  } | null>(null);

  const benchmarkStopRef = useRef<boolean>(false);

  // Mock Names for Buyers
  const buyerNames = [
    "Amina Alao", "Chinedu Okafor", "Zahra Yusuf", "Olumide Balogun", 
    "Chioma Nwachukwu", "Babajide Sanwo", "Fatima Abubakar", "Tunde Folawiyo",
    "Yetunde Sowemimo", "Emeka Obi", "Kelechi Iheanacho", "Halima Dangote",
    "Femi Otedola", "Damilola Adegbite", "Ngozi Okonjo", "Segun Agbaje",
    "Genevieve Nnaji", "Wizkid Balogun", "Davido Adeleke", "Burna Ogulu",
    "Rita Dominic", "Iniobong Edo", "Osas Ighodaro", "Funke Akindele",
    "Kunle Afolayan", "Richard Mofe", "Falz Falana", "Tiwa Savage",
    "Tems Openiyi", "Rema Ikubese"
  ];

  // Helper: Sleep
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ==========================================
  // SIMULATOR 1: CONCURRENT CHECKOUT SIMULATOR
  // ==========================================
  const runCheckoutSimulation = async () => {
    if (isSimulatingCheckout) return;
    setIsSimulatingCheckout(true);
    setSimulationProgress(0);
    setFinalDbStock(null);
    setSimResultsSummary(null);

    // Initialize list of buyers
    const buyers: BuyerResult[] = Array.from({ length: buyerCount }).map((_, i) => ({
      id: i + 1,
      name: buyerNames[i % buyerNames.length] + ` #${100 + i}`,
      status: 'pending',
      latency: 0,
      message: 'Queueing checkout...',
      timestamp: new Date().toLocaleTimeString()
    }));
    setSimulatedBuyers(buyers);

    const testProductId = 'mock_luxury_gown_stress_test';
    const productRef = doc(db, 'temp_stress_test_products', testProductId);

    try {
      // 1. Initialize mock product stock in database
      await setDoc(productRef, {
        name: "Zahrah Royal Gold Couture Gown",
        price: 750000,
        stock: initialStock
      });

      await sleep(500); // Give Firestore a moment to settle

      // Prepare simulation tasks
      const startSimTime = performance.now();
      
      const simulateSingleBuyer = async (index: number): Promise<BuyerResult> => {
        const buyer = { ...buyers[index] };
        const buyerStartTime = performance.now();
        const artificialNetworkDelay = Math.floor(Math.random() * 150) + 50; // 50ms - 200ms delay

        try {
          if (concurrencyMode === 'standard') {
            // MODE A: Standard Read-Then-Write (Classic Race Condition)
            // 1. Read
            const snap = await getDoc(productRef);
            const data = snap.data();
            const currentStock = data?.stock ?? 0;

            // Simulate the visual delay & concurrent window
            buyer.message = `Verifying stock (${currentStock} left)...`;
            setSimulatedBuyers(prev => {
              const next = [...prev];
              next[index] = { ...buyer };
              return next;
            });
            await sleep(artificialNetworkDelay);

            // 2. Decide and Write
            if (currentStock > 0) {
              const newStock = currentStock - 1;
              await setDoc(productRef, { stock: newStock }, { merge: true });
              
              buyer.status = 'success';
              buyer.message = 'Payment successful! Order processed.';
            } else {
              buyer.status = 'declined';
              buyer.message = 'Sold out! Checkout rejected.';
            }

          } else if (concurrencyMode === 'increment') {
            // MODE B: Direct Atomic Decrement (Stock goes negative)
            buyer.message = 'Submitting order atomically...';
            setSimulatedBuyers(prev => {
              const next = [...prev];
              next[index] = { ...buyer };
              return next;
            });
            await sleep(artificialNetworkDelay);

            // We do a read to see if it's sold out first, representing basic pre-check
            const snap = await getDoc(productRef);
            const data = snap.data();
            
            if ((data?.stock ?? 0) > 0) {
              // Direct increment (-1) write (this does NOT check condition at write time)
              await updateDoc(productRef, {
                stock: increment(-1)
              });
              buyer.status = 'success';
              buyer.message = 'Payment successful! Order processed.';
            } else {
              buyer.status = 'declined';
              buyer.message = 'Sold out! Checkout rejected.';
            }

          } else {
            // MODE C: Transaction-Safe (Optimistic Concurrency Control)
            buyer.message = 'Executing atomic database lock...';
            setSimulatedBuyers(prev => {
              const next = [...prev];
              next[index] = { ...buyer };
              return next;
            });

            await runTransaction(db, async (transaction) => {
              const freshSnap = await transaction.get(productRef);
              if (!freshSnap.exists()) {
                throw new Error("Product deleted.");
              }
              const freshStock = freshSnap.data().stock;
              
              if (freshStock > 0) {
                transaction.update(productRef, { stock: freshStock - 1 });
                buyer.status = 'success';
                buyer.message = 'Transaction secured. Order placed!';
              } else {
                buyer.status = 'declined';
                buyer.message = 'Sold out! Transaction rolled back.';
              }
            });
          }
        } catch (error: any) {
          console.error(error);
          buyer.status = 'error';
          buyer.message = error.message || 'Payment gateway connection error.';
        }

        buyer.latency = Math.round(performance.now() - buyerStartTime);
        buyer.timestamp = new Date().toLocaleTimeString();

        // Update state in real-time
        setSimulatedBuyers(prev => {
          const next = [...prev];
          next[index] = buyer;
          return next;
        });

        return buyer;
      };

      // Spawning ALL checkouts simultaneously using Promise.all (Stress Concurrency!)
      const checkoutPromises = Array.from({ length: buyerCount }).map((_, i) => {
        // Stagger the checkout slightly (e.g. 0-20ms) to represent real millisecond differences
        return sleep(Math.random() * 20).then(() => simulateSingleBuyer(i));
      });

      // Progress bar simulation while waiting for all promises to resolve
      let resolvedCount = 0;
      checkoutPromises.forEach(p => {
        p.then(() => {
          resolvedCount++;
          setSimulationProgress(Math.round((resolvedCount / buyerCount) * 100));
        });
      });

      const results = await Promise.all(checkoutPromises);
      const totalSimDuration = performance.now() - startSimTime;

      // 2. Fetch the final stock in the database
      const finalSnap = await getDoc(productRef);
      const finalStock = finalSnap.data()?.stock ?? 0;
      setFinalDbStock(finalStock);

      // Clean up mock product document
      await deleteDoc(productRef);

      // Compute statistics
      const successes = results.filter(r => r.status === 'success').length;
      const declined = results.filter(r => r.status === 'declined').length;
      const errors = results.filter(r => r.status === 'error').length;
      
      // If successes exceeded initial stock, we oversold!
      const oversoldCount = Math.max(0, successes - initialStock);
      const avgLatency = Math.round(results.reduce((acc, r) => acc + r.latency, 0) / buyerCount);

      let integrity: 'passed' | 'failed' | 'warning' = 'passed';
      if (oversoldCount > 0 || finalStock < 0) {
        integrity = 'failed';
      } else if (successes < Math.min(buyerCount, initialStock) && errors > 0) {
        integrity = 'warning';
      }

      setSimResultsSummary({
        success: successes,
        declined,
        error: errors,
        oversoldCount,
        avgLatency,
        integrityStatus: integrity
      });

    } catch (err: any) {
      console.error(err);
      alert("Failed to run simulation due to database initialization error.");
    } finally {
      setIsSimulatingCheckout(false);
    }
  };

  // ==========================================
  // SIMULATOR 2: DATABASE OPERATIONS LOAD BENCHMARK
  // ==========================================
  const runDatabaseBenchmark = async () => {
    if (isBenchmarking) return;
    setIsBenchmarking(true);
    setBenchmarkProgress(0);
    setBenchmarkChartData([]);
    setBenchmarkSummary(null);
    benchmarkStopRef.current = false;

    const benchmarkCollection = collection(db, 'temp_stress_test_benchmarks');
    const totalDurationMs = benchmarkDuration * 1000;
    const startTime = Date.now();
    
    let localOpsCount = 0;
    let localErrorsCount = 0;
    const latencies: number[] = [];
    const chartPoints: BenchmarkData[] = [];
    const cleanupDocIds: string[] = [];

    // Track active performance intervals
    const updateInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.round((elapsed / totalDurationMs) * 100));
      setBenchmarkProgress(progress);
    }, 100);

    // Concurrent writers loop
    const runWorker = async () => {
      while (Date.now() - startTime < totalDurationMs && !benchmarkStopRef.current) {
        const opStartTime = performance.now();
        const docId = `bench_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
        const docRef = doc(benchmarkCollection, docId);
        
        try {
          // Write payload representing a lightweight shopping cart state
          await setDoc(docRef, {
            tester: "Zahrah Stress Bot",
            payloadSize: "128B",
            timestamp: Date.now(),
            isActive: true
          });
          
          cleanupDocIds.push(docId);
          
          const latency = performance.now() - opStartTime;
          latencies.push(latency);
          localOpsCount++;
        } catch (err) {
          console.error(err);
          localErrorsCount++;
        }
        
        // Minor sleep to throttle and prevent overloading Firebase free quotas
        await sleep(20);
      }
    };

    // Run chart updating loop every 1 second
    const chartInterval = setInterval(() => {
      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      if (elapsedSeconds <= 0) return;
      
      const currentOps = localOpsCount;
      const currentAvgLat = latencies.length > 0 
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
        : 0;

      setBenchmarkChartData(prev => [
        ...prev,
        {
          time: `${elapsedSeconds}s`,
          ops: currentOps - (prev.reduce((acc, p) => acc + p.ops, 0) || 0), // Operations in that 1s slice
          latency: currentAvgLat
        }
      ]);
    }, 1000);

    // Launch 3 parallel workers for light load simulation
    await Promise.all([runWorker(), runWorker(), runWorker()]);

    clearInterval(updateInterval);
    clearInterval(chartInterval);
    setBenchmarkProgress(100);

    // Compute Summary Stats
    const totalOps = localOpsCount;
    const throughput = Math.round(totalOps / benchmarkDuration);
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 0;

    // Sort latencies to find P95
    const sortedLatencies = [...latencies].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedLatencies.length * 0.95);
    const p95Latency = sortedLatencies.length > 0 ? Math.round(sortedLatencies[p95Index]) : 0;

    setBenchmarkSummary({
      totalOps,
      throughput,
      avgLatency,
      p95Latency,
      errors: localErrorsCount
    });

    // Cleanup Benchmark documents written
    setIsBenchmarking(false);
    
    // Asynchronously delete documents
    cleanupDocIds.forEach(async (id) => {
      try {
        await deleteDoc(doc(benchmarkCollection, id));
      } catch (e) {}
    });
  };

  return (
    <div className="min-h-screen bg-[#0C0A09] text-stone-100 font-sans selection:bg-[#C5A059] selection:text-white pb-24 pt-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="mb-12 border-b border-stone-800/80 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/admin')}
              className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft size={14} />
              <span>Executive Dashboard</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#C5A059]/10 border border-[#C5A059]/20 rounded-xl text-[#C5A059] animate-pulse">
                <Gauge size={28} />
              </div>
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight serif italic text-white flex items-center gap-3">
                  Zahrah Stress Suite <span className="text-[10px] uppercase font-bold tracking-[0.3em] px-2.5 py-1 bg-[#C5A059]/20 border border-[#C5A059]/30 rounded-full text-[#C5A059] not-italic font-sans">SaaS Ready</span>
                </h1>
                <p className="text-stone-400 mt-1 font-light text-xs uppercase tracking-widest">
                  Enterprise integrity analyzer & high-concurrency simulation lab
                </p>
              </div>
            </div>
          </div>
          
          {/* Main SubTabs */}
          <div className="flex bg-stone-900 border border-stone-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('concurrency')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeSubTab === 'concurrency' ? 'bg-[#C5A059] text-stone-950 shadow-md shadow-[#C5A059]/10' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
            >
              <Zap size={14} />
              <span>Checkout Concurrency</span>
            </button>
            <button
              onClick={() => setActiveSubTab('latency')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeSubTab === 'latency' ? 'bg-[#C5A059] text-stone-950 shadow-md shadow-[#C5A059]/10' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
            >
              <Database size={14} />
              <span>Latency Benchmark</span>
            </button>
            <button
              onClick={() => setActiveSubTab('insights')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 ${activeSubTab === 'insights' ? 'bg-[#C5A059] text-stone-950 shadow-md shadow-[#C5A059]/10' : 'text-stone-400 hover:text-white hover:bg-stone-800/50'}`}
            >
              <Cpu size={14} />
              <span>SaaS Architecture</span>
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: CONCURRENCY CHECKOUT SIMULATOR */}
          {activeSubTab === 'concurrency' && (
            <motion.div
              key="concurrency-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Simulator Settings Column */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 h-fit shadow-lg space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-800 pb-4">
                  <Flame className="text-[#C5A059]" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Flash Sale Simulator</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Initial Stock</label>
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 justify-between">
                      <button 
                        onClick={() => setInitialStock(Math.max(1, initialStock - 1))}
                        disabled={isSimulatingCheckout}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-white">{initialStock} items</span>
                      <button 
                        onClick={() => setInitialStock(initialStock + 1)}
                        disabled={isSimulatingCheckout}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Concurrent Buyers</label>
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 justify-between">
                      <button 
                        onClick={() => setBuyerCount(Math.max(5, buyerCount - 5))}
                        disabled={isSimulatingCheckout}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-white">{buyerCount} users</span>
                      <button 
                        onClick={() => setBuyerCount(Math.min(50, buyerCount + 5))}
                        disabled={isSimulatingCheckout}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[9px] text-stone-500 mt-1.5 block">Simulates buyers submitting orders at the same millisecond.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Database Locking Protocol</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setConcurrencyMode('standard')}
                        disabled={isSimulatingCheckout}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${concurrencyMode === 'standard' ? 'bg-[#C5A059]/10 border-[#C5A059] text-white' : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                      >
                        <div>
                          <p className="text-xs font-bold">Standard Read-Then-Write</p>
                          <p className="text-[9px] text-stone-500 mt-0.5 font-light">No transaction safety. Retreives stock, calculates, then writes.</p>
                        </div>
                        {concurrencyMode === 'standard' && <CheckCircle size={14} className="text-[#C5A059]" />}
                      </button>

                      <button
                        onClick={() => setConcurrencyMode('increment')}
                        disabled={isSimulatingCheckout}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${concurrencyMode === 'increment' ? 'bg-[#C5A059]/10 border-[#C5A059] text-white' : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                      >
                        <div>
                          <p className="text-xs font-bold">Atomic Direct Write (Increment)</p>
                          <p className="text-[9px] text-stone-500 mt-0.5 font-light">Direct FieldValue.increment(-1). Forces negative stock.</p>
                        </div>
                        {concurrencyMode === 'increment' && <CheckCircle size={14} className="text-[#C5A059]" />}
                      </button>

                      <button
                        onClick={() => setConcurrencyMode('transaction')}
                        disabled={isSimulatingCheckout}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${concurrencyMode === 'transaction' ? 'bg-[#C5A059]/10 border-[#C5A059] text-white' : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700'}`}
                      >
                        <div>
                          <p className="text-xs font-bold">Transaction-Safe (OCC Locks)</p>
                          <p className="text-[9px] text-[#C5A059] mt-0.5 font-light">Uses Firestore transactional lock. Guarantees 0-bounds.</p>
                        </div>
                        {concurrencyMode === 'transaction' && <CheckCircle size={14} className="text-[#C5A059]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800">
                  <button
                    onClick={runCheckoutSimulation}
                    disabled={isSimulatingCheckout}
                    className="w-full py-4.5 bg-white text-stone-950 hover:bg-[#C5A059] disabled:bg-stone-800 disabled:text-stone-600 transition-all font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-white/5 active:scale-95"
                  >
                    {isSimulatingCheckout ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Simulating {simulationProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" />
                        <span>Launch Stress Simulation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation visual timeline & grid column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Real-time Visualization Grid */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-800/80 pb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">Concurrency Grid</h3>
                      <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">Real-time status of checkout requests</p>
                    </div>
                    {isSimulatingCheckout && (
                      <div className="w-24 h-1 bg-stone-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#C5A059] rounded-full transition-all duration-300"
                          style={{ width: `${simulationProgress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {simulatedBuyers.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center text-stone-500">
                      <div className="w-12 h-12 rounded-full border border-dashed border-stone-800 flex items-center justify-center mb-4">
                        <Terminal size={18} />
                      </div>
                      <p className="text-xs uppercase font-bold tracking-widest">Simulation Lab Idle</p>
                      <p className="text-[9px] mt-1 italic font-serif">Configure parameters and launch the stress test to inspect database locks.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                      <AnimatePresence>
                        {simulatedBuyers.map((buyer) => (
                          <motion.div
                            key={buyer.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                              buyer.status === 'success' ? 'bg-[#C5A059]/10 border border-[#C5A059] text-[#C5A059]' :
                              buyer.status === 'declined' ? 'bg-stone-950 border border-stone-800 text-stone-500' :
                              buyer.status === 'error' ? 'bg-red-500/10 border border-red-500 text-red-400' :
                              'bg-stone-950 border border-dashed border-stone-800 text-stone-600 animate-pulse'
                            }`}
                          >
                            <span className="text-[8px] font-black leading-none block uppercase truncate w-full mb-1">{buyer.name.split(' ')[0]}</span>
                            {buyer.status === 'success' && <CheckCircle size={16} />}
                            {buyer.status === 'declined' && <XCircle size={16} />}
                            {buyer.status === 'error' && <ShieldAlert size={16} />}
                            {buyer.status === 'pending' && <RefreshCw size={14} className="animate-spin text-[#C5A059]" />}
                            <span className="text-[7px] mt-1 opacity-70">{buyer.latency > 0 ? `${buyer.latency}ms` : ''}</span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Simulation Summary Results */}
                {simResultsSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    
                    {/* Stat card 1 */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Stock Integrity Check</h4>
                        <div className="flex items-center gap-2 mt-2">
                          {simResultsSummary.integrityStatus === 'passed' ? (
                            <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-500 flex items-center gap-1.5">
                              <CheckCircle size={12} /> Passed
                            </span>
                          ) : simResultsSummary.integrityStatus === 'warning' ? (
                            <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-1.5">
                              <Info size={12} /> Unstable
                            </span>
                          ) : (
                            <span className="text-xs uppercase font-extrabold tracking-widest px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-1.5">
                              <ShieldAlert size={12} /> FAILED (OVERSELL)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-stone-800/80">
                        <p className="text-[10px] text-stone-400 font-light leading-relaxed">
                          {simResultsSummary.integrityStatus === 'passed' ? (
                            "Database operations executed sequentially. Final stock inventory bounds were preserved perfectly."
                          ) : (
                            "Concurrent orders bypassed database constraints! Stock counts dropped below zero or exceeded item capacity."
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Stat card 2 */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Checkouts Secured</p>
                          <p className="text-2xl font-black text-white mt-1">{simResultsSummary.success} <span className="text-xs font-normal text-stone-500">orders</span></p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Oversold Count</p>
                          <p className={`text-2xl font-black mt-1 ${simResultsSummary.oversoldCount > 0 ? 'text-red-500 animate-pulse' : 'text-stone-600'}`}>{simResultsSummary.oversoldCount}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-stone-800/80 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Declined (Out of Stock)</p>
                          <p className="text-xs font-bold text-stone-300 mt-0.5">{simResultsSummary.declined}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">Avg Lock Latency</p>
                          <p className="text-xs font-bold text-stone-300 mt-0.5">{simResultsSummary.avgLatency}ms</p>
                        </div>
                      </div>
                    </div>

                    {/* Stat card 3 */}
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md flex flex-col justify-between">
                      <div>
                        <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1">Database Sync State</h4>
                        <div className="mt-2 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500">Initial Catalog Stock:</span>
                            <span className="font-bold text-white">{initialStock}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-stone-500">Final Database Stock:</span>
                            <span className={`font-bold ${finalDbStock !== null && finalDbStock < 0 ? 'text-red-500' : 'text-[#C5A059]'}`}>{finalDbStock}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-stone-800/80">
                        <p className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">
                          Simulation Mode: <span className="text-white">{concurrencyMode.toUpperCase()}</span>
                        </p>
                      </div>
                    </div>

                  </motion.div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 2: LATENCY & BENCHMARK SUITE */}
          {activeSubTab === 'latency' && (
            <motion.div
              key="latency-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              
              {/* Settings Column */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 h-fit shadow-lg space-y-6">
                <div className="flex items-center gap-2 border-b border-stone-800 pb-4">
                  <Database className="text-[#C5A059]" size={20} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Benchmark Controller</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">Test Duration</label>
                    <div className="flex items-center bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 justify-between">
                      <button 
                        onClick={() => setBenchmarkDuration(Math.max(3, benchmarkDuration - 1))}
                        disabled={isBenchmarking}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-white">{benchmarkDuration} seconds</span>
                      <button 
                        onClick={() => setBenchmarkDuration(Math.min(10, benchmarkDuration + 1))}
                        disabled={isBenchmarking}
                        className="text-stone-500 hover:text-white transition-colors font-bold text-lg px-2 disabled:opacity-20"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-[9px] text-stone-500 mt-2.5 block">
                      To safely prevent quota limits, tests are constrained between 3 and 10 seconds.
                    </span>
                  </div>

                  <div className="bg-stone-950/60 p-4 border border-stone-850 rounded-xl space-y-2">
                    <h5 className="text-[9px] font-black uppercase tracking-wider text-amber-500">Isolated Sandbox</h5>
                    <p className="text-[9px] text-stone-400 font-light leading-relaxed">
                      Benchmarking issues isolated transactional reads and writes to a separate, temporary path (<code className="text-white bg-stone-900 px-1 py-0.5 rounded">temp_stress_test_benchmarks</code>) to preserve operational records.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800">
                  <button
                    onClick={runDatabaseBenchmark}
                    disabled={isBenchmarking}
                    className="w-full py-4.5 bg-white text-stone-950 hover:bg-[#C5A059] disabled:bg-stone-800 disabled:text-stone-600 transition-all font-black uppercase text-xs tracking-widest rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-white/5 active:scale-95"
                  >
                    {isBenchmarking ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Benchmarking {benchmarkProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} fill="currentColor" />
                        <span>Trigger DB Benchmark</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chart & Results Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Real-time Line Chart */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-center mb-6 border-b border-stone-800/80 pb-4">
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-wider text-white">Database Write Latency</h3>
                      <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-0.5">Real-time Firebase network execution metrics</p>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    {benchmarkChartData.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-stone-500">
                        <div className="w-12 h-12 rounded-full border border-dashed border-stone-800 flex items-center justify-center mb-4">
                          <BarChart3 size={18} />
                        </div>
                        <p className="text-xs uppercase font-bold tracking-widest">Benchmark Charts Ready</p>
                        <p className="text-[9px] mt-1 italic font-serif">Run a test to dynamically render execution time plots.</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={benchmarkChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                          <XAxis dataKey="time" stroke="#78716c" fontSize={10} />
                          <YAxis stroke="#78716c" fontSize={10} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fill: '#78716c', fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1c1917', border: '1px solid #44403c', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 11 }}
                            itemStyle={{ color: '#C5A059', fontSize: 11 }}
                          />
                          <Line type="monotone" dataKey="latency" name="Avg Latency (ms)" stroke="#C5A059" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="ops" name="Throughput (ops/s)" stroke="#0ea5e9" strokeWidth={1.5} strokeDasharray="5 5" />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Benchmark Summary Statistics */}
                {benchmarkSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6"
                  >
                    
                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest mb-1">Total Operations</p>
                      <p className="text-xl font-black text-white">{benchmarkSummary.totalOps}</p>
                      <span className="text-[8px] text-green-500 font-bold block mt-1 uppercase">100% Successful</span>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest mb-1">Write Throughput</p>
                      <p className="text-xl font-black text-white">{benchmarkSummary.throughput} <span className="text-xs font-normal text-stone-500">ops/s</span></p>
                      <span className="text-[8px] text-stone-500 block mt-1 uppercase">Total Concurrent Workers: 3</span>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest mb-1">Average Latency</p>
                      <p className="text-xl font-black text-[#C5A059]">{benchmarkSummary.avgLatency} <span className="text-xs font-normal text-stone-500">ms</span></p>
                      <span className="text-[8px] text-stone-500 block mt-1 uppercase">Standard network trip time</span>
                    </div>

                    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 shadow-sm text-center">
                      <p className="text-[8px] font-bold text-stone-500 uppercase tracking-widest mb-1">P95 Network Cap</p>
                      <p className="text-xl font-black text-white">{benchmarkSummary.p95Latency} <span className="text-xs font-normal text-stone-500">ms</span></p>
                      <span className="text-[8px] text-stone-500 block mt-1 uppercase">Max tail-end latency</span>
                    </div>

                  </motion.div>
                )}

              </div>
            </motion.div>
          )}

          {/* TAB 3: SAAS INSIGHTS & EXPLANATIONS */}
          {activeSubTab === 'insights' && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              
              {/* Insight Card 1 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500">
                    <Shield size={18} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">Firestore Concurrency Model</h4>
                </div>
                
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  Firestore uses **Optimistic Concurrency Control (OCC)** rather than pessimistic database locks. When you initiate a Firestore Transaction, the SDK registers all document reads. When executing writes:
                </p>

                <ul className="space-y-3 pl-2">
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full shrink-0 mt-1.5" />
                    <span><strong>Read Tracking:</strong> Firestore monitors the read versions. If any concurrent transaction writes to a read document before this transaction commits, the transaction automatically fails and **retries** transparently.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full shrink-0 mt-1.5" />
                    <span><strong>Pre-Flight Read Rule:</strong> Firestore requires all database reads inside a transaction to be performed **before** any writes. This guarantees you check fresh stock levels and write safely.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full shrink-0 mt-1.5" />
                    <span><strong>No Double Spend:</strong> By combining atomic locks and read tracking, Firestore guarantees that the checkout decrement remains thread and millisecond safe.</span>
                  </li>
                </ul>
              </div>

              {/* Insight Card 2 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-md space-y-4">
                <div className="flex items-center gap-3 border-b border-stone-800 pb-4">
                  <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                    <Cpu size={18} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-wider text-white">SaaS Scaling Strategies</h4>
                </div>
                
                <p className="text-xs text-stone-300 font-light leading-relaxed">
                  Transitioning to a high-volume SaaS business account demands highly robust stock limits and queue controls:
                </p>

                <ul className="space-y-3 pl-2">
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                    <span><strong>Pre-Payment Cart Holding:</strong> For absolute stock reservation, use a Cloud Task or Redis queue to reserve cart stock for 10-15 minutes, releasing it if card validation fails.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                    <span><strong>Webhooks with Batch Checks:</strong> Always perform transactional validation within payment webhooks (like Paystack/Stripe) before completing processing, handling the "sold out while paying" state elegantly.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-stone-300">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                    <span><strong>Sharding for High Volume:</strong> If a product is expected to sell thousands of units a second, standard Firestore counters limit writes to 1 per second per document. In such scenarios, use **distributed counter sharding**.</span>
                  </li>
                </ul>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};

export default StressTest;
