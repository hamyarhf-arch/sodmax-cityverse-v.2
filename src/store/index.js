import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supabase from '../lib/supabase';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        phone,
        password,
      });
      
      if (error) throw error;
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      return { ...data, profile };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, phone, password, referralCode }, { rejectWithValue }) => {
    try {
      // Generate referral code
      const referralCodeGenerated = generateReferralCode(name);
      
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        phone,
        password,
        options: {
          data: {
            name,
            referral_code: referralCodeGenerated,
          },
        },
      });
      
      if (authError) throw authError;
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            name,
            phone,
            referral_code: referralCodeGenerated,
            referred_by: referralCode ? await getUserIdByReferralCode(referralCode) : null,
          },
        ]);
      
      if (profileError) throw profileError;
      
      // Create user wallet
      await supabase
        .from('user_wallets')
        .insert([{ user_id: authData.user.id }]);
      
      // Create mining stats
      await supabase
        .from('mining_stats')
        .insert([{ user_id: authData.user.id }]);
      
      // Handle referral
      if (referralCode) {
        await handleReferral(referralCode, authData.user.id);
      }
      
      return authData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const mineSOD = createAsyncThunk(
  'mining/mine',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth, mining } = getState();
      const userId = auth.user.id;
      
      // Calculate earnings
      const baseEarn = mining.miningPower;
      const multiplier = mining.boostActive ? 3 : 1;
      const earned = baseEarn * multiplier;
      
      // Update wallet
      const { error: walletError } = await supabase
        .from('user_wallets')
        .update({
          sod_balance: supabase.raw(`sod_balance + ${earned}`),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (walletError) throw walletError;
      
      // Update mining stats
      const { error: miningError } = await supabase
        .from('mining_stats')
        .update({
          today_earned: supabase.raw(`today_earned + ${earned}`),
          total_mined: supabase.raw(`total_mined + ${earned}`),
          last_mine_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
      
      if (miningError) throw miningError;
      
      // Record transaction
      await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            transaction_type: 'mining',
            amount: earned,
            currency: 'sod',
            description: 'استخراج دستی',
            status: 'completed',
          },
        ]);
      
      return { earned };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const participateInCampaign = createAsyncThunk(
  'campaigns/participate',
  async ({ campaignId, participationData }, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const userId = auth.user.id;
      
      // Check if already participated
      const { data: existing } = await supabase
        .from('campaign_participations')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId)
        .single();
      
      if (existing) {
        throw new Error('شما قبلاً در این کمپین شرکت کرده‌اید');
      }
      
      // Create participation
      const { data: participation, error } = await supabase
        .from('campaign_participations')
        .insert([
          {
            campaign_id: campaignId,
            user_id: userId,
            participation_type: participationData.type,
            completion_data: participationData.data,
            status: 'in_progress',
          },
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      return participation;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper functions
const generateReferralCode = (name) => {
  const namePart = name.replace(/\s/g, '').substring(0, 3).toUpperCase();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `${namePart}${randomPart}`;
};

const getUserIdByReferralCode = async (referralCode) => {
  const { data } = await supabase
    .from('users')
    .select('id')
    .eq('referral_code', referralCode)
    .single();
  return data?.id;
};

const handleReferral = async (referralCode, newUserId) => {
  const referrerId = await getUserIdByReferralCode(referralCode);
  
  if (referrerId) {
    // Create referral record
    await supabase
      .from('referrals')
      .insert([
        {
          referrer_id: referrerId,
          referred_id: newUserId,
          status: 'registered',
        },
      ]);
    
    // Give bonus to new user
    await supabase
      .from('user_wallets')
      .update({
        sod_balance: supabase.raw('sod_balance + 500'),
      })
      .eq('user_id', newUserId);
    
    // Give reward to referrer
    await supabase
      .from('user_wallets')
      .update({
        toman_balance: supabase.raw('toman_balance + 1000'),
      })
      .eq('user_id', referrerId);
    
    // Record transactions
    await supabase
      .from('transactions')
      .insert([
        {
          user_id: newUserId,
          transaction_type: 'referral_bonus',
          amount: 500,
          currency: 'sod',
          description: 'پاداش ثبت‌نام با کد دعوت',
          status: 'completed',
        },
        {
          user_id: referrerId,
          transaction_type: 'referral_reward',
          amount: 1000,
          currency: 'toman',
          description: 'پاداش دعوت دوست',
          status: 'completed',
        },
      ]);
  }
};

// Slices
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      supabase.auth.signOut();
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.profile;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const miningSlice = createSlice({
  name: 'mining',
  initialState: {
    miningPower: 5,
    miningMultiplier: 1,
    autoMining: false,
    todayEarned: 0,
    totalMined: 0,
    boostActive: false,
    boostEndTime: null,
    loading: false,
  },
  reducers: {
    setMiningStats: (state, action) => {
      Object.assign(state, action.payload);
    },
    toggleAutoMining: (state) => {
      state.autoMining = !state.autoMining;
    },
    activateBoost: (state) => {
      state.boostActive = true;
      state.miningMultiplier = 3;
      state.boostEndTime = Date.now() + 30000; // 30 seconds
    },
    deactivateBoost: (state) => {
      state.boostActive = false;
      state.miningMultiplier = 1;
      state.boostEndTime = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(mineSOD.fulfilled, (state, action) => {
        state.todayEarned += action.payload.earned;
        state.totalMined += action.payload.earned;
      });
  },
});

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    sodBalance: 0,
    tomanBalance: 0,
    usdtBalance: 0,
    transactions: [],
    loading: false,
  },
  reducers: {
    setWalletBalance: (state, action) => {
      state.sodBalance = action.payload.sod_balance;
      state.tomanBalance = action.payload.toman_balance;
      state.usdtBalance = action.payload.usdt_balance;
    },
    setTransactions: (state, action) => {
      state.transactions = action.payload;
    },
    updateBalance: (state, action) => {
      const { currency, amount } = action.payload;
      if (currency === 'sod') state.sodBalance += amount;
      if (currency === 'toman') state.tomanBalance += amount;
      if (currency === 'usdt') state.usdtBalance += amount;
    },
  },
});

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: [],
    participations: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCampaigns: (state, action) => {
      state.campaigns = action.payload;
    },
    setParticipations: (state, action) => {
      state.participations = action.payload;
    },
    addParticipation: (state, action) => {
      state.participations.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(participateInCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(participateInCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.participations.push(action.payload);
      })
      .addCase(participateInCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// Store Configuration
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    mining: miningSlice.reducer,
    wallet: walletSlice.reducer,
    campaigns: campaignsSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const { logout, setUser } = authSlice.actions;
export const { setMiningStats, toggleAutoMining, activateBoost, deactivateBoost } = miningSlice.actions;
export const { setWalletBalance, setTransactions, updateBalance } = walletSlice.actions;
export const { setCampaigns, setParticipations, addParticipation } = campaignsSlice.actions;
