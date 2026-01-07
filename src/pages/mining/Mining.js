import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mineSOD, toggleAutoMining, activateBoost } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Play,
  Pause,
  Rocket,
  TrendingUp,
  Clock,
  BarChart3,
  BatteryCharging,
  Coins,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Mining = () => {
  const dispatch = useDispatch();
  const { miningPower, miningMultiplier, autoMining, todayEarned, totalMined, boostActive, boostEndTime } = useSelector((state) => state.mining);
  const { sodBalance } = useSelector((state) => state.wallet);
  const [miningEffects, setMiningEffects] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  const miningData = {
    labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
    datasets: [
      {
        label: 'استخراج روزانه (SOD)',
        data: [2450, 3210, 2890, 3500, 4200, 3800, 4100],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'آمار هفتگی استخراج',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
      },
    },
  };

  const handleMine = () => {
    dispatch(mineSOD()).then(() => {
      // Create mining effect
      const earned = miningPower * miningMultiplier;
      const effect = {
        id: Date.now(),
        amount: earned,
        x: Math.random() * 80 + 10,
      };
      setMiningEffects((prev) => [...prev, effect]);

      // Remove effect after animation
      setTimeout(() => {
        setMiningEffects((prev) => prev.filter((e) => e.id !== effect.id));
      }, 1000);

      toast.success(`+${earned} SOD استخراج شد!`);
    });
  };

  const handleBoost = () => {
    if (sodBalance >= 5000) {
      dispatch(activateBoost());
      toast.success('افزایش قدرت فعال شد! (۳۰ ثانیه)');
    } else {
      toast.error('موجودی SOD کافی نیست!');
    }
  };

  useEffect(() => {
    if (boostActive && boostEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((boostEndTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [boostActive, boostEndTime]);

  const upgrades = [
    { id: 1, name: 'افزایش قدرت پایه', cost: 50000, effect: '+۵ قدرت', current: miningPower },
    { id: 2, name: 'کاهش زمان استخراج', cost: 75000, effect: '-۲۰٪ زمان', current: '۱x' },
    { id: 3, name: 'شانس استخراج دوبرابر', cost: 100000, effect: '+۱۰٪ شانس', current: '۵٪' },
    { id: 4, name: 'ظرفیت ذخیره‌سازی', cost: 150000, effect: '+۱۰K ظرفیت', current: '۵۰K' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Zap className="text-yellow-500" />
            مرکز استخراج SOD
          </h1>
          <p className="text-gray-400 mt-1">ارز SOD را استخراج کنید و درآمد کسب نمایید</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">قدرت استخراج</p>
            <p className="text-2xl font-bold">{miningPower * miningMultiplier}x</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-sm text-gray-400">امروز</p>
            <p className="text-2xl font-bold">{todayEarned.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Mining Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Mining Area */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-col items-center justify-center">
              {/* Mining Effects */}
              <AnimatePresence>
                {miningEffects.map((effect) => (
                  <motion.div
                    key={effect.id}
                    initial={{ y: 0, opacity: 1, x: `${effect.x}%` }}
                    animate={{ y: -100, opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-blue-400 font-bold text-xl pointer-events-none"
                    style={{ left: `${effect.x}%` }}
                  >
                    +{effect.amount} SOD
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Mining Core */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-blue-900/30 to-gray-900 border-4 border-blue-500/30 shadow-2xl shadow-blue-500/20 cursor-pointer"
                onClick={handleMine}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 360],
                    }}
                    transition={{
                      scale: {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }}
                    className="text-6xl mb-4"
                  >
                    ⚡
                  </motion.div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    +{miningPower * miningMultiplier} SOD
                  </div>
                  <p className="text-gray-400 mt-2">برای استخراج کلیک کنید</p>
                </div>

                {/* Boost Indicator */}
                {boostActive && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                    {timeLeft}s
                  </div>
                )}
              </motion.div>

              {/* Mining Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 w-full max-w-md">
                <button
                  onClick={() => dispatch(toggleAutoMining())}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                    autoMining
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  {autoMining ? (
                    <Pause size={24} className="mb-2" />
                  ) : (
                    <Play size={24} className="mb-2" />
                  )}
                  <span className="font-bold">خودکار</span>
                </button>

                <button
                  onClick={handleBoost}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all ${
                    boostActive
                      ? 'bg-gradient-to-r from-orange-500 to-red-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  disabled={boostActive}
                >
                  <Rocket size={24} className="mb-2" />
                  <span className="font-bold">افزایش قدرت</span>
                </button>

                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all">
                  <TrendingUp size={24} className="mb-2" />
                  <span className="font-bold">ارتقاء</span>
                </button>

                <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all">
                  <BarChart3 size={24} className="mb-2" />
                  <span className="font-bold">آمار</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mining Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <BatteryCharging className="text-blue-400" />
                <div>
                  <p className="text-gray-400">قدرت پایه</p>
                  <p className="text-2xl font-bold">{miningPower}x</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Coins className="text-yellow-400" />
                <div>
                  <p className="text-gray-400">کل استخراج</p>
                  <p className="text-2xl font-bold">{totalMined.toLocaleString()} SOD</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Clock className="text-green-400" />
                <div>
                  <p className="text-gray-400">زمان فعالیت</p>
                  <p className="text-2xl font-bold">۱۸:۴۵:۱۲</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Upgrades & Stats */}
        <div className="space-y-6">
          {/* Upgrades */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              ارتقاء ماینر
            </h2>
            <div className="space-y-4">
              {upgrades.map((upgrade) => (
                <div
                  key={upgrade.id}
                  className="bg-gray-800/50 rounded-lg p-4 hover:bg-gray-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold">{upgrade.name}</h3>
                      <p className="text-sm text-gray-400">{upgrade.effect}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-400">{upgrade.cost.toLocaleString()} SOD</p>
                      <p className="text-xs text-gray-400">فعلی: {upgrade.current}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <Line data={miningData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Mining History */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-4">تاریخچه استخراج</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-400 border-b border-gray-700">
                <th className="py-3 text-right">تاریخ</th>
                <th className="py-3 text-right">مقدار</th>
                <th className="py-3 text-right">نوع</th>
                <th className="py-3 text-right">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'امروز - ۱۴:۳۰', amount: '+۱۸۰ SOD', type: 'دستی', status: 'موفق' },
                { date: 'امروز - ۱۲:۱۵', amount: '+۱۸۰ SOD', type: 'دستی', status: 'موفق' },
                { date: 'دیروز - ۱۸:۴۵', amount: '+۱۸۰ SOD', type: 'دستی', status: 'موفق' },
                { date: 'دیروز - ۱۰:۲۰', amount: '+۹۰ SOD', type: 'خودکار', status: 'موفق' },
                { date: '۱۳۹۹/۰۵/۰۲', amount: '+۵۰۰۰ SOD', type: 'ارتقاء', status: 'موفق' },
              ].map((item, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3">{item.date}</td>
                  <td className="py-3 font-bold text-green-400">{item.amount}</td>
                  <td className="py-3">{item.type}</td>
                  <td className="py-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Mining;
