import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import supabase from '../../lib/supabase';
import { useSelector, useDispatch } from 'react-redux';
import { participateInCampaign } from '../../store';
import {
  ArrowRight,
  Target,
  Clock,
  Users,
  Award,
  CheckCircle,
  Eye,
  Share2,
  Download,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [participationData, setParticipationData] = useState({});
  const [step, setStep] = useState(1);

  // Fetch campaign details
  const { data: campaign, isLoading } = useQuery(
    ['campaign', id],
    async () => {
      const { data, error } = await supabase
        .from('business_campaigns')
        .select(`
          *,
          businesses (*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    }
  );

  // Check if user already participated
  const { data: participation } = useQuery(
    ['participation', id, user?.id],
    async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('campaign_participations')
        .select('*')
        .eq('campaign_id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    { enabled: !!user }
  );

  const getRequirements = () => {
    if (!campaign?.requirements) return [];
    
    const reqs = [];
    const requirements = campaign.requirements;
    
    if (requirements.min_clicks) {
      reqs.push(`حداقل ${requirements.min_clicks} کلیک`);
    }
    if (requirements.view_duration) {
      reqs.push(`مشاهده ${requirements.view_duration} ثانیه‌ای`);
    }
    if (requirements.platforms) {
      reqs.push(`اشتراک در ${requirements.platforms.join(' یا ')}`);
    }
    if (requirements.min_followers) {
      reqs.push(`حداقل ${requirements.min_followers} فالوور`);
    }
    if (requirements.app_id) {
      reqs.push('نصب اپلیکیشن');
    }
    if (requirements.registration_required) {
      reqs.push('ثبت‌نام در سرویس');
    }
    
    return reqs;
  };

  const handleParticipate = async () => {
    if (!user) {
      toast.error('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }

    if (participation) {
      toast.error('شما قبلاً در این کمپین شرکت کرده‌اید');
      return;
    }

    try {
      // Simulate participation based on campaign type
      let participationData = {};
      
      switch (campaign.campaign_type) {
        case 'click':
          participationData = { type: 'click', data: { clicks: 1 } };
          break;
        case 'view':
          participationData = { type: 'view', data: { duration: 30 } };
          break;
        case 'share':
          participationData = { type: 'share', data: { platform: 'telegram' } };
          break;
        case 'install':
          participationData = { type: 'install', data: { app_id: campaign.requirements?.app_id } };
          break;
        default:
          participationData = { type: 'generic', data: {} };
      }

      await dispatch(participateInCampaign({
        campaignId: id,
        participationData,
      })).unwrap();

      toast.success('با موفقیت در کمپین شرکت کردید!');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'خطا در شرکت در کمپین');
    }
  };

  const getCampaignSteps = () => {
    const steps = [
      { number: 1, title: 'مطالعه شرایط', description: 'شرایط کمپین را به دقت مطالعه کنید' },
      { number: 2, title: 'انجام وظیفه', description: 'وظیفه تعیین‌شده را انجام دهید' },
      { number: 3, title: 'تأیید و دریافت پاداش', description: 'پاداش خود را دریافت کنید' },
    ];

    if (campaign?.campaign_type === 'click') {
      steps[1].description = 'بر روی لینک کلیک کنید و ۳۰ ثانیه صفحه را مشاهده کنید';
    } else if (campaign?.campaign_type === 'install') {
      steps[1].description = 'اپلیکیشن را نصب و ثبت‌نام کنید';
    } else if (campaign?.campaign_type === 'share') {
      steps[1].description = 'پست را در شبکه اجتماعی خود به اشتراک بگذارید';
    }

    return steps;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-bold mb-2">کمپین یافت نشد</h3>
        <p className="text-gray-400">کمپین مورد نظر وجود ندارد یا حذف شده است</p>
        <button
          onClick={() => navigate('/campaigns')}
          className="mt-6 px-6 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          بازگشت به لیست کمپین‌ها
        </button>
      </div>
    );
  }

  const steps = getCampaignSteps();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate('/campaigns')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
          >
            <ArrowRight className="rotate-180" size={20} />
            <span>بازگشت به کمپین‌ها</span>
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Target size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{campaign.title}</h1>
              <p className="text-gray-400 mt-1">{campaign.businesses?.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {participation ? (
            <div className="px-4 py-2 bg-green-500/20 text-green-400 rounded-full font-bold">
              شرکت کرده‌اید
            </div>
          ) : (
            <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-bold">
              فعال
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">توضیحات کمپین</h2>
            <p className="text-gray-300 leading-relaxed">
              {campaign.description || 'توضیحاتی برای این کمپین وجود ندارد'}
            </p>
          </div>

          {/* Requirements */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">شرایط شرکت</h2>
            <div className="space-y-3">
              {getRequirements().map((req, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <span>{req}</span>
                </div>
              ))}
              {getRequirements().length === 0 && (
                <p className="text-gray-400">شرایط خاصی تعریف نشده است</p>
              )}
            </div>
          </div>

          {/* Participation Steps */}
          {!participation && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold mb-6">مراحل شرکت در کمپین</h2>
              <div className="space-y-8">
                {steps.map((stepItem, index) => (
                  <div key={stepItem.number} className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step > stepItem.number
                        ? 'bg-green-500 text-white'
                        : step === stepItem.number
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-800 text-gray-400'
                    }`}>
                      {stepItem.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{stepItem.title}</h3>
                      <p className="text-gray-400">{stepItem.description}</p>
                    </div>
                    {step === stepItem.number && (
                      <div className="animate-pulse">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {step === 2 && campaign.campaign_type === 'click' && (
                <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="font-bold mb-3">برای ادامه لطفاً:</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => window.open(campaign.requirements?.url, '_blank')}
                      className="w-full py-3 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                      کلیک برای مشاهده تبلیغ
                    </button>
                    <p className="text-sm text-gray-400 text-center">
                      پس از کلیک، ۳۰ ثانیه صفحه را مشاهده کنید
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && campaign.campaign_type === 'share' && (
                <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
                  <h4 className="font-bold mb-3">برای اشتراک‌گذاری:</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        const text = `کمپین ${campaign.title} در SODmAX\n${campaign.businesses?.name}\n${window.location.origin}/campaigns/${id}`;
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="py-3 bg-blue-500 rounded-lg font-bold hover:bg-blue-600 transition-colors"
                    >
                      تلگرام
                    </button>
                    <button
                      onClick={() => {
                        const text = `کمپین ${campaign.title} در SODmAX`;
                        window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + window.location.href)}`, '_blank');
                      }}
                      className="py-3 bg-green-500 rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      واتساپ
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Stats & Action */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">آمار کمپین</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-gray-400" />
                  <span className="text-gray-400">شرکت‌کنندگان</span>
                </div>
                <span className="font-bold">
                  {campaign.current_participants || 0} نفر
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award size={20} className="text-gray-400" />
                  <span className="text-gray-400">ظرفیت باقی‌مانده</span>
                </div>
                <span className="font-bold">
                  {campaign.max_participants ? 
                    `${campaign.max_participants - (campaign.current_participants || 0)} نفر` : 
                    'نامحدود'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-gray-400" />
                  <span className="text-gray-400">زمان باقی‌مانده</span>
                </div>
                <span className="font-bold">
                  {Math.ceil((new Date(campaign.end_date) - new Date()) / (1000 * 60 * 60 * 24))} روز
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target size={20} className="text-gray-400" />
                  <span className="text-gray-400">بودجه مصرف‌شده</span>
                </div>
                <span className="font-bold">
                  {Math.round(((campaign.spent_budget || 0) / campaign.total_budget) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-6">پاداش‌ها</h2>
            <div className="space-y-4">
              {campaign.reward_sod > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-400 text-xl">S</span>
                    </div>
                    <div>
                      <p className="font-bold">SOD</p>
                      <p className="text-sm text-gray-400">ارز داخلی بازی</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-blue-400">
                    +{campaign.reward_sod.toLocaleString()}
                  </span>
                </div>
              )}

              {campaign.reward_toman > 0 && (
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-green-400 text-xl">ت</span>
                    </div>
                    <div>
                      <p className="font-bold">تومان</p>
                      <p className="text-sm text-gray-400">پول واقعی</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-green-400">
                    +{campaign.reward_toman.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          {!participation ? (
            <button
              onClick={() => {
                if (step === 1) {
                  setStep(2);
                } else if (step === 2) {
                  handleParticipate();
                }
              }}
              disabled={step === 3}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                step === 3
                  ? 'bg-green-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90'
              }`}
            >
              {step === 1 ? 'شروع کمپین' : 
               step === 2 ? 'تأیید و دریافت پاداش' : 
               'کمپین تکمیل شد'}
            </button>
          ) : (
            <div className="text-center p-6 bg-gradient-to-br from-green-900/20 to-gray-900 rounded-2xl border border-green-500/30">
              <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
              <h3 className="font-bold text-lg mb-2">شما در این کمپین شرکت کرده‌اید</h3>
              <p className="text-gray-400">
                وضعیت: <span className="text-green-400 font-bold">{participation.status}</span>
              </p>
              {participation.status === 'completed' && (
                <p className="mt-4 text-green-400 font-bold">
                  پاداش شما پرداخت شد!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
