import { Plan, UserSubscription, TranscriptionQuota, PlanDuration } from '@/types/subscription';

export class SubscriptionService {
  private static readonly PLANS: Plan[] = [
    {
      id: 'starter',
      name: 'Starter Project',
      price: 39,
      duration: '72h',
      maxAudioHours: 2,
      features: [
        'Up to 2 hours of audio',
        'High-accuracy transcription (93%+)',
        'Basic speaker diarization',
        'Auto punctuation & casing',
        'Automatic language detection',
        'Basic text summary',
        'Download in TXT & DOC formats',
        '72-hour access to dashboard',
        'Email support',
      ],
    },
    {
      id: 'professional',
      name: 'Professional Project',
      price: 129,
      duration: '7d',
      maxAudioHours: 10,
      features: [
        'Up to 10 hours of audio',
        'Priority transcription queue',
        'Advanced speaker diarization',
        'Multichannel audio support',
        'Custom vocabulary & spelling',
        'Profanity filtering',
        'Filler word removal',
        'Advanced AI summary & analysis',
        'Entity detection',
        'Key phrases extraction',
        'Download in all formats (TXT, DOC, SRT, VTT)',
        'Timestamps & speaker labels',
        'Chapter markers',
        'Priority email & chat support',
        '7-day access to dashboard',
      ],
    },
    {
      id: 'business',
      name: 'Business Project',
      price: 349,
      duration: '30d',
      maxAudioHours: 35,
      features: [
        'Up to 35 hours of audio',
        'Highest priority transcription',
        'Real-time streaming transcription',
        'Advanced speaker diarization',
        'PII redaction',
        'Custom vocabulary & spelling',
        'Topic detection & classification',
        'Sentiment analysis',
        'Advanced entity detection',
        'End of utterance detection',
        'ITN/Formatting',
        'Custom export templates',
        'Team collaboration (up to 5 members)',
        'API access with documentation',
        'Bulk processing',
        'Advanced analytics dashboard',
        '24/7 Premium support',
        '30-day access to dashboard',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Solution',
      price: 999,
      duration: '30d',
      maxAudioHours: 120,
      features: [
        'Up to 120 hours of audio',
        'Unlimited real-time streaming',
        'Dedicated transcription queue',
        'Advanced PII redaction',
        'Custom AI model fine-tuning',
        'Custom LLM prompts',
        'Advanced audio intelligence',
        'Multi-language support',
        'Enterprise-grade security',
        'Custom integration support',
        'Unlimited team members',
        'Dedicated account manager',
        'Custom feature development',
        'SLA guarantees',
        'Priority bug fixes',
        'Quarterly business reviews',
        'White-label options',
        'Custom retention policies',
      ],
    },
  ];

  static getPlan(planId: string): Plan | undefined {
    return this.PLANS.find(plan => plan.id === planId);
  }

  static getAllPlans(): Plan[] {
    return [...this.PLANS];
  }

  static calculateEndDate(duration: PlanDuration): Date {
    const now = new Date();
    switch (duration) {
      case '72h':
        return new Date(now.getTime() + 72 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        throw new Error('Invalid duration');
    }
  }

  static async createSubscription(userId: string, planId: string): Promise<UserSubscription> {
    const plan = this.getPlan(planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    const subscription: UserSubscription = {
      userId,
      planId,
      startDate: new Date(),
      endDate: this.calculateEndDate(plan.duration),
      isActive: true,
      audioHoursUsed: 0,
    };

    // Here you would typically save the subscription to your database
    // await db.subscriptions.create(subscription);

    return subscription;
  }

  static async getQuota(userId: string): Promise<TranscriptionQuota> {
    // Here you would typically fetch the user's active subscription from your database
    // const subscription = await db.subscriptions.findActive(userId);
    
    // For demo purposes, returning mock data
    const mockSubscription: UserSubscription = {
      userId,
      planId: 'professional',
      startDate: new Date(),
      endDate: this.calculateEndDate('7d'),
      isActive: true,
      audioHoursUsed: 2,
    };

    const plan = this.getPlan(mockSubscription.planId);
    if (!plan) {
      throw new Error('Invalid plan');
    }

    return {
      remainingHours: plan.maxAudioHours - mockSubscription.audioHoursUsed,
      totalHours: plan.maxAudioHours,
      expiresAt: mockSubscription.endDate,
    };
  }

  static async updateUsage(userId: string, audioHours: number): Promise<void> {
    // Here you would typically update the user's usage in your database
    // await db.subscriptions.updateUsage(userId, audioHours);
    console.log(`Updated usage for user ${userId}: +${audioHours} hours`);
  }

  static async isSubscriptionValid(userId: string): Promise<boolean> {
    // Here you would typically check the user's subscription status in your database
    // const subscription = await db.subscriptions.findActive(userId);
    // return subscription && subscription.isActive && new Date() < subscription.endDate;
    
    // For demo purposes, returning true
    return true;
  }
}
