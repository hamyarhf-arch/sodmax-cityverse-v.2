import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import supabase from '../../lib/supabase';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  TrendingUp,
  Users,
  Clock,
  Award,
  Target,
  Eye,
  Share2,
  Download,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Campaigns = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery('campaigns', async () => {
    const { data, error } = await supabase
      .from('business_campaigns')
      .select(`
        *,
        businesses (name, logo_url)
      `)
      .eq('status', 'active')
      .gte('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  });

  // Fetch user participations
  const { data: participations } = useQuery('participations', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('campaign_participations')
      .select('campaign_id, status')
      .eq('user_id', user.id);
    
    if (error) throw error;
    return data;
  });

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case 'click': return <Eye size={20} />;
      case 'view': return <Eye size={20} />;
      case 'share': return <Share2 size={20} />;
      case 'install': return <Download size={20} />;
      case 'purchase': return <ShoppingBag size={20} />;
      default: return <Target size={20} />;
    }
  };

  const getCampaignTypeText = (type) => {
    switch (type) {
      case 'click': return 'کلیک';
      case 'view': return 'مشاهده';
      case 'share': return 'اشتراک‌گذاری';
      case 'install': return 'نصب';
      case 'purchase': return 'خرید';
      default: return type;
    }
  };

  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(search.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter === 'all' || campaign.campaign_type === filter;
    
    const notParticipated = !participations?.some(p => p.campaign_id === campaign.id);
    
    return matchesSearch && matchesFilter && notParticipated;
  });

  const categories = [
    { id: 'all', label: 'همه', icon: Target },
    { id: 'click', label: 'کلیک', icon: Eye },
    { id: 'view', label: 'مشاهده', icon: Eye },
    { id: 'share', label: 'اشتراک', icon: Share2 },
    { id: 'install', label: 'نصب', icon: Download },
    { id: 'purchase', label: 'خرید', icon: ShoppingBag },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Target className="text-blue-500" />
          کمپین‌های فعال
        </h1>
        <p className="text-gray-400 mt-1">در کمپین‌ها شرکت کنید و SOD و تومان کسب کنید</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="جستجوی کمپین..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = filter === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">کمپین‌های فعال</p>
              <p className="text-2xl font-bold">{campaigns?.length || 0}</p>
            </div>
            <Target className="text-blue-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">شرکت کرده‌اید</p>
              <p className="text-2xl font-bold">{participations?.length || 0}</p>
            </div>
            <Award className="text-green-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">درآمد از کمپین‌ها</p>
              <p className="text-2xl font-bold">۱۲۴K</p>
            </div>
            <TrendingUp className="text-purple-400" size={24} />
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-900/30 to-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">زمان باقی‌مانده</p>
              <p className="text-2xl font-bold">۱۸:۴۵:۱۲</p>
            </div>
            <Clock className="text-orange-400" size={24} />
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns?.length === 0 ? (
        <div className="text-center py-12">
          <Target size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">کمپینی یافت نشد</h3>
          <p className="text-gray-400">هیچ کمپینی با فیلترهای انتخاب‌شده یافت نشد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns?.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer"
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              {/* Campaign Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {getCampaignTypeIcon(campaign.campaign_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{campaign.title}</h3>
                      <p className="text-sm text-gray-400">{campaign.businesses?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
                    {getCampaignTypeIcon(campaign.campaign_type)}
                    <span className="text-sm">{getCampaignTypeText(campaign.campaign_type)}</span>
                  </div>
                </div>

                <p className="text-gray-300 mb-6 line-clamp-2">
                  {campaign.description || 'توضیحاتی برای این کمپین وجود ندارد'}
                </p>

                {/* Rewards */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {campaign.reward_sod > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-blue-400">S</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">SOD</p>
                          <p className="font-bold">{campaign.reward_sod.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                    {campaign.reward_toman > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                          <span className="font-bold text-green-400">ت</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">تومان</p>
                          <p className="font-bold">{campaign.reward_toman.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress and Stats */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">ظرفیت</span>
                    <span>
                      {campaign.current_participants || 0} / {campaign.max_participants || 'نامحدود'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      style={{ 
                        width: `${campaign.max_participants ? 
                          Math.min(100, (campaign.current_participants / campaign.max_participants) * 100) : 
                          50}%` 
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span>زمان باقی‌مانده</span>
                    </div>
                    <span className="font-bold">
                      {Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24))} روز
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-6 pb-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/campaigns/${campaign.id}`);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  شرکت در کمپین
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Campaigns Section */}
      {participations && participations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">کمپین‌های تکمیل‌شده</h2>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="py-3 text-right">کمپین</th>
                    <th className="py-3 text-right">نوع</th>
                    <th className="py-3 text-right">پاداش</th>
                    <th className="py-3 text-right">تاریخ</th>
                    <th className="py-3 text-right">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { campaign: 'کلیک تبلیغاتی دیجی‌کالا', type: 'کلیک', reward: '+۵۰۰ SOD', date: 'امروز', status: 'پرداخت شده' },
                    { campaign: 'نصب اپلیکیشن اسنپ', type: 'نصب', reward: '+۵,۰۰۰ تومان', date: 'دیروز', status: 'پرداخت شده' },
                    { campaign: 'اشتراک اینستاگرام', type: 'اشتراک', reward: '+۲,۰۰۰ SOD', date: '۲ روز پیش', status: 'در انتظار' },
                  ].map((item, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-3 font-bold">{item.campaign}</td>
                      <td className="py-3">
                        <span className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-green-400">{item.reward}</td>
                      <td className="py-3 text-gray-400">{item.date}</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          item.status === 'پرداخت شده' 
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
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
      )}
    </div>
  );
};

export default Campaigns;
