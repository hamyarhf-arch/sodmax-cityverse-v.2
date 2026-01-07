import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Plus,
  Filter,
  Download,
  Eye,
  Share2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  const stats = {
    totalSpent: 12500000,
    activeCampaigns: 8,
    totalParticipants: 4521,
    conversionRate: 24.5,
    avgCostPerAction: 2760,
    totalEarnings: 38500000,
  };

  const campaignData = {
    labels: ['دیجی‌کالا', 'اسنپ', 'آپ', 'تپسی', 'شیپور', 'دیوار'],
    datasets: [
      {
        label: 'تعداد شرکت‌کننده',
        data: [1200, 850, 630, 420, 380, 290],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'پاداش پرداختی',
        data: [6000000, 4250000, 3150000, 2100000, 1900000, 1450000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const performanceData = {
    labels: ['کلیک', 'مشاهده', 'اشتراک', 'نصب', 'خرید'],
    datasets: [
      {
        data: [35, 25, 15, 15, 10],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
          '#f59e0b',
          '#ef4444',
        ],
      },
    ],
  };

  const campaigns = [
    {
      id: 1,
      title: 'کلیک تبلیغاتی جدید',
      type: 'click',
      budget: 2000000,
      spent: 1250000,
      participants: 850,
      status: 'active',
      startDate: '1402/05/10',
      endDate: '1402/06/10',
    },
    {
      id: 2,
      title: 'نصب اپلیکیشن',
      type: 'install',
      budget: 5000000,
      spent: 3850000,
      participants: 420,
      status: 'active',
      startDate: '1402/05/01',
      endDate: '1402/07/01',
    },
    {
      id: 3,
      title: 'اشتراک اینستاگرام',
      type: 'share',
      budget: 1000000,
      spent: 980000,
      participants: 1200,
      status: 'completed',
      startDate: '1402/04/15',
      endDate: '1402/05/15',
    },
    {
      id: 4,
      title: 'مشاهده ویدیو',
      type: 'view',
      budget: 1500000,
      spent: 750000,
      participants: 630,
      status: 'paused',
      startDate: '1402/05/20',
      endDate: '1402/06/20',
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400',
      completed: 'bg-blue-500/20 text-blue-400',
      paused: 'bg-yellow-500/20 text-yellow-400',
      expired: 'bg-red-500/20 text-red-400',
    };
    
    const icons = {
      active: <CheckCircle size={14} />,
      completed: <CheckCircle size={14} />,
      paused: <Clock size={14} />,
      expired: <XCircle size={14} />,
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${styles[status]}`}>
        {icons[status]}
        {status === 'active' ? 'فعال' : 
         status === 'completed' ? 'تکمیل شده' : 
         status === 'paused' ? 'متوقف' : 'منقضی'}
      </span>
    );
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'click': return <Eye size={16} />;
      case 'view': return <Eye size={16} />;
      case 'share': return <Share2 size={16} />;
      case 'install': return <Download size={16} />;
      default: return <Target size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">داشبورد کسب‌وکار</h1>
          <p className="text-gray-400 mt-1">مدیریت کمپین‌ها و تحلیل عملکرد</p>
        </div>
        <button
          onClick={() => setShowCreateCampaign(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          ایجاد کمپین جدید
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800">
        {['overview', 'campaigns', 'analytics', 'transactions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab === 'overview' && 'نمای کلی'}
            {tab === 'campaigns' && 'کمپین‌ها'}
            {tab === 'analytics' && 'تحلیل‌ها'}
            {tab === 'transactions' && 'تراکنش‌ها'}
          </button>
        ))}
      </div>

      {/* Stats Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">هزینه کل</p>
                  <p className="text-2xl font-bold">{stats.totalSpent.toLocaleString()} تومان</p>
                </div>
                <DollarSign className="text-blue-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
                <TrendingUp size={16} />
                <span>۱۲٪+ نسبت به ماه قبل</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">کمپین‌های فعال</p>
                  <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                </div>
                <Target className="text-green-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-gray-400">
                از ۸ کمپین فعال
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">شرکت‌کنندگان کل</p>
                  <p className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</p>
                </div>
                <Users className="text-purple-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-gray-400">
                میانگین روزانه: ۱۵۰ نفر
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">نرخ تبدیل</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
                <TrendingUp className="text-yellow-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
                <TrendingUp size={16} />
                <span>۵٪+ بهبود</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">هزینه هر اقدام</p>
                  <p className="text-2xl font-bold">{stats.avgCostPerAction.toLocaleString()} تومان</p>
                </div>
                <DollarSign className="text-red-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
                <TrendingUp size={16} />
                <span>۸٪- کاهش</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-gray-900 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400">درآمد تخمینی</p>
                  <p className="text-2xl font-bold">{stats.totalEarnings.toLocaleString()} تومان</p>
                </div>
                <BarChart3 className="text-cyan-400" size={24} />
              </div>
              <div className="mt-4 text-sm text-green-400 flex items-center gap-1">
                <TrendingUp size={16} />
                <span>۲۳٪+ رشد</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">عملکرد کمپین‌ها</h3>
              <Bar 
                data={campaignData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
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
                }}
              />
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-6">توزیع انواع کمپین</h3>
              <div className="flex items-center justify-center h-64">
                <Pie 
                  data={performanceData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Campaigns List */}
      {activeTab === 'campaigns' && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h3 className="text-xl font-bold">کمپین‌های شما</h3>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Filter size={18} />
                <span>فیلتر</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Download size={18} />
                <span>خروجی</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="py-4 text-right pr-6">کمپین</th>
                  <th className="py-4 text-right">نوع</th>
                  <th className="py-4 text-right">بودجه</th>
                  <th className="py-4 text-right">مصرف شده</th>
                  <th className="py-4 text-right">شرکت‌کننده</th>
                  <th className="py-4 text-right">وضعیت</th>
                  <th className="py-4 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="py-4 pr-6">
                      <div>
                        <h4 className="font-bold">{campaign.title}</h4>
                        <p className="text-sm text-gray-400">
                          {campaign.startDate} تا {campaign.endDate}
                        </p>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        {getCampaignTypeIcon(campaign.type)}
                        <span>{campaign.type === 'click' ? 'کلیک' : 
                               campaign.type === 'install' ? 'نصب' : 
                               campaign.type === 'share' ? 'اشتراک' : 
                               campaign.type === 'view' ? 'مشاهده' : campaign.type}</span>
                      </div>
                    </td>
                    <td className="py-4 font-bold">{campaign.budget.toLocaleString()} تومان</td>
                    <td className="py-4">
                      <div>
                        <span className="font-bold">{campaign.spent.toLocaleString()} تومان</span>
                        <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                          <div 
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-bold">{campaign.participants.toLocaleString()} نفر</td>
                    <td className="py-4">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                          ویرایش
                        </button>
                        <button className="px-3 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 transition-colors">
                          جزئیات
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-700 flex items-center justify-between">
            <p className="text-gray-400">نمایش ۱ تا ۸ از ۸ کمپین</p>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                ←
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-blue-500 rounded-lg">1</button>
              <button className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                2
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold">ایجاد کمپین جدید</h3>
              <button
                onClick={() => setShowCreateCampaign(false)}
                className="p-2 hover:bg-gray-800 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-gray-400 mb-2">عنوان کمپین</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: کلیک تبلیغاتی دیجی‌کالا"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">توضیحات</label>
                <textarea
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="توضیحات کامل کمپین"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 mb-2">نوع کمپین</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="click">کلیک</option>
                    <option value="view">مشاهده</option>
                    <option value="share">اشتراک‌گذاری</option>
                    <option value="install">نصب</option>
                    <option value="purchase">خرید</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">بودجه کل (تومان)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1000000"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">تاریخ شروع</label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 mb-2">تاریخ پایان</label>
                  <input
                    type="date"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">پاداش‌ها</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">SOD</span>
                      <input
                        type="number"
                        className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-right"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400">ارز داخلی بازی</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400">تومان</span>
                      <input
                        type="number"
                        className="w-32 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-right"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-gray-400">پول واقعی</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">شرایط شرکت</label>
                <textarea
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder='مثال: {"min_clicks": 1, "view_duration": 30}'
                />
                <p className="text-xs text-gray-400 mt-2">
                  شرایط را به صورت JSON وارد کنید
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateCampaign(false)}
                className="px-6 py-2 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  toast.success('کمپین با موفقیت ایجاد شد');
                  setShowCreateCampaign(false);
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                ایجاد کمپین
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
