/**
 * CoachingSquad - "God Mode" for Real-World Coaches
 * 
 * A specialized Squad type that bridges B2C and B2B:
 * - User invites their real-world coach
 * - Coach gets read-only access to user's data
 * - Coach can inject Plan Cards into user's chat stream
 * - Drives bulk user acquisition through trainers
 */

import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

export type CoachingRole = 'coach' | 'client';

export interface CoachingSquad {
  id: string;
  name: string;
  coachId: string;
  coachName: string;
  coachAvatar?: string;
  coachCredentials?: string; // "CSCS", "RD", "CPT"
  createdAt: string;
  isActive: boolean;
  clientCount: number;
  maxClients: number; // Based on coach tier
}

export interface CoachingClient {
  id: string;
  squadId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: string;
  permissions: ClientPermissions;
  lastSyncAt?: string;
  status: 'active' | 'paused' | 'removed';
}

export interface ClientPermissions {
  // What data the coach can see
  viewNutrition: boolean;
  viewWorkouts: boolean;
  viewSleep: boolean;
  viewWeight: boolean;
  viewRecovery: boolean;
  viewJournal: boolean; // Only if user explicitly shares
  
  // What the coach can do
  sendMessages: boolean;
  sendPlanCards: boolean;
  adjustMacros: boolean; // Suggest, not force
}

export interface CoachMessage {
  id: string;
  squadId: string;
  clientId: string;
  coachId: string;
  type: 'text' | 'plan_card' | 'macro_suggestion' | 'encouragement';
  content: string;
  planCard?: PlanCardPayload;
  macroSuggestion?: MacroSuggestionPayload;
  createdAt: string;
  readAt?: string;
}

export interface PlanCardPayload {
  type: 'workout' | 'meal' | 'weekly';
  title: string;
  subtitle?: string;
  items: PlanItem[];
  validFrom?: string;
  validUntil?: string;
}

export interface PlanItem {
  name: string;
  detail?: string;
  value?: string | number;
}

export interface MacroSuggestionPayload {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  reason: string;
  validFrom: string;
  validUntil?: string;
}

export interface ClientSnapshot {
  userId: string;
  userName: string;
  date: string;
  
  // Nutrition
  nutrition: {
    calories: { consumed: number; target: number; };
    protein: { consumed: number; target: number; };
    carbs: { consumed: number; target: number; };
    fats: { consumed: number; target: number; };
    compliance: number; // percentage
  };
  
  // Activity
  activity: {
    steps: number;
    workouts: { name: string; duration: number; }[];
    caloriesBurned: number;
  };
  
  // Health
  health: {
    weight?: number;
    sleepHours?: number;
    recoveryScore?: number;
  };
  
  // Streak
  streak: number;
  
  // Alerts
  alerts: ClientAlert[];
}

export interface ClientAlert {
  type: 'missed_log' | 'low_protein' | 'streak_risk' | 'weight_change' | 'recovery_low';
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

// ============================================================================
// DEFAULT PERMISSIONS
// ============================================================================

export const DEFAULT_CLIENT_PERMISSIONS: ClientPermissions = {
  viewNutrition: true,
  viewWorkouts: true,
  viewSleep: true,
  viewWeight: false, // Privacy - opt-in
  viewRecovery: true,
  viewJournal: false, // Privacy - opt-in
  sendMessages: true,
  sendPlanCards: true,
  adjustMacros: true, // Suggestions only
};

// ============================================================================
// COACHING SQUAD SERVICE
// ============================================================================

class CoachingSquadServiceClass {
  
  // ============================================================================
  // SQUAD MANAGEMENT (For Coaches)
  // ============================================================================
  
  /**
   * Create a new coaching squad
   */
  async createSquad(coachId: string, name: string, credentials?: string): Promise<CoachingSquad | null> {
    if (!isSupabaseConfigured()) {
      console.warn('[CoachingSquad] Supabase not configured');
      return null;
    }
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('coaching_squads')
      .insert({
        coach_id: coachId,
        name,
        coach_credentials: credentials,
        is_active: true,
        max_clients: 10, // Default tier
      })
      .select()
      .single();
    
    if (error) {
      console.error('[CoachingSquad] Error creating squad:', error);
      return null;
    }
    
    return this.mapToCoachingSquad(data);
  }
  
  /**
   * Get coach's squad
   */
  async getCoachSquad(coachId: string): Promise<CoachingSquad | null> {
    if (!isSupabaseConfigured()) return null;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('coaching_squads')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .single();
    
    if (error || !data) return null;
    
    return this.mapToCoachingSquad(data);
  }
  
  /**
   * Generate invite code for clients
   */
  async generateInviteCode(squadId: string): Promise<string | null> {
    if (!isSupabaseConfigured()) return null;
    
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('coaching_invites')
      .insert({
        squad_id: squadId,
        code,
        expires_at: expiresAt.toISOString(),
      });
    
    if (error) {
      console.error('[CoachingSquad] Error generating invite:', error);
      return null;
    }
    
    return code;
  }
  
  // ============================================================================
  // CLIENT MANAGEMENT
  // ============================================================================
  
  /**
   * Join a coaching squad using invite code (for clients)
   */
  async joinSquad(userId: string, inviteCode: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Service unavailable' };
    }
    
    const supabase = getSupabase();
    
    // Validate invite code
    const { data: invite, error: inviteError } = await supabase
      .from('coaching_invites')
      .select('squad_id, expires_at, used')
      .eq('code', inviteCode.toUpperCase())
      .single();
    
    if (inviteError || !invite) {
      return { success: false, error: 'Invalid invite code' };
    }
    
    if (invite.used) {
      return { success: false, error: 'Invite code already used' };
    }
    
    if (new Date(invite.expires_at) < new Date()) {
      return { success: false, error: 'Invite code expired' };
    }
    
    // Add client to squad
    const { error: joinError } = await supabase
      .from('coaching_clients')
      .insert({
        squad_id: invite.squad_id,
        user_id: userId,
        permissions: DEFAULT_CLIENT_PERMISSIONS,
        status: 'active',
      });
    
    if (joinError) {
      console.error('[CoachingSquad] Error joining squad:', joinError);
      return { success: false, error: 'Failed to join squad' };
    }
    
    // Mark invite as used
    await supabase
      .from('coaching_invites')
      .update({ used: true })
      .eq('code', inviteCode.toUpperCase());
    
    return { success: true };
  }
  
  /**
   * Leave coaching squad (for clients)
   */
  async leaveSquad(userId: string, squadId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('coaching_clients')
      .update({ status: 'removed' })
      .eq('user_id', userId)
      .eq('squad_id', squadId);
    
    return !error;
  }
  
  /**
   * Update client permissions
   */
  async updatePermissions(
    userId: string,
    squadId: string,
    permissions: Partial<ClientPermissions>
  ): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    
    const supabase = getSupabase();
    const { error } = await supabase
      .from('coaching_clients')
      .update({ permissions })
      .eq('user_id', userId)
      .eq('squad_id', squadId);
    
    return !error;
  }
  
  // ============================================================================
  // DATA ACCESS (For Coaches)
  // ============================================================================
  
  /**
   * Get all clients in a squad
   */
  async getSquadClients(squadId: string): Promise<CoachingClient[]> {
    if (!isSupabaseConfigured()) return [];
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('coaching_clients')
      .select(`
        *,
        users:user_id (
          id,
          name,
          avatar_url
        )
      `)
      .eq('squad_id', squadId)
      .eq('status', 'active');
    
    if (error || !data) return [];
    
    return data.map(this.mapToCoachingClient);
  }
  
  /**
   * Get a client's snapshot (for coach dashboard)
   */
  async getClientSnapshot(clientId: string, squadId: string): Promise<ClientSnapshot | null> {
    if (!isSupabaseConfigured()) return null;
    
    const supabase = getSupabase();
    
    // Get client info and permissions
    const { data: client, error: clientError } = await supabase
      .from('coaching_clients')
      .select('*')
      .eq('user_id', clientId)
      .eq('squad_id', squadId)
      .single();
    
    if (clientError || !client) return null;
    
    // Get today's data based on permissions
    const today = new Date().toISOString().split('T')[0];
    const permissions = client.permissions as ClientPermissions;
    
    // Fetch allowed data
    const snapshot: ClientSnapshot = {
      userId: clientId,
      userName: client.user_name || 'Client',
      date: today,
      nutrition: {
        calories: { consumed: 0, target: 2000 },
        protein: { consumed: 0, target: 150 },
        carbs: { consumed: 0, target: 200 },
        fats: { consumed: 0, target: 65 },
        compliance: 0,
      },
      activity: {
        steps: 0,
        workouts: [],
        caloriesBurned: 0,
      },
      health: {},
      streak: 0,
      alerts: [],
    };
    
    // In a real implementation, fetch data from user's logs
    // Based on permissions, include or exclude data
    
    // Generate alerts
    snapshot.alerts = this.generateClientAlerts(snapshot, permissions);
    
    return snapshot;
  }
  
  // ============================================================================
  // COACH MESSAGING
  // ============================================================================
  
  /**
   * Send a message to a client
   */
  async sendMessage(
    coachId: string,
    clientId: string,
    squadId: string,
    message: Omit<CoachMessage, 'id' | 'coachId' | 'createdAt'>
  ): Promise<CoachMessage | null> {
    if (!isSupabaseConfigured()) return null;
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('coach_messages')
      .insert({
        coach_id: coachId,
        client_id: clientId,
        squad_id: squadId,
        type: message.type,
        content: message.content,
        plan_card: message.planCard,
        macro_suggestion: message.macroSuggestion,
      })
      .select()
      .single();
    
    if (error) {
      console.error('[CoachingSquad] Error sending message:', error);
      return null;
    }
    
    return this.mapToCoachMessage(data);
  }
  
  /**
   * Send a plan card to a client
   */
  async sendPlanCard(
    coachId: string,
    clientId: string,
    squadId: string,
    planCard: PlanCardPayload
  ): Promise<boolean> {
    const message = await this.sendMessage(coachId, clientId, squadId, {
      squadId,
      clientId,
      type: 'plan_card',
      content: `New ${planCard.type} plan: ${planCard.title}`,
      planCard,
    });
    
    return message !== null;
  }
  
  /**
   * Suggest macro adjustments to a client
   */
  async suggestMacros(
    coachId: string,
    clientId: string,
    squadId: string,
    suggestion: MacroSuggestionPayload
  ): Promise<boolean> {
    const message = await this.sendMessage(coachId, clientId, squadId, {
      squadId,
      clientId,
      type: 'macro_suggestion',
      content: suggestion.reason,
      macroSuggestion: suggestion,
    });
    
    return message !== null;
  }
  
  /**
   * Get messages for a client
   */
  async getClientMessages(clientId: string, squadId: string): Promise<CoachMessage[]> {
    if (!isSupabaseConfigured()) return [];
    
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('coach_messages')
      .select('*')
      .eq('client_id', clientId)
      .eq('squad_id', squadId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error || !data) return [];
    
    return data.map(this.mapToCoachMessage);
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  private generateClientAlerts(snapshot: ClientSnapshot, permissions: ClientPermissions): ClientAlert[] {
    const alerts: ClientAlert[] = [];
    
    // Check nutrition compliance
    if (permissions.viewNutrition && snapshot.nutrition.compliance < 50) {
      alerts.push({
        type: 'missed_log',
        severity: 'warning',
        message: 'Low tracking compliance today',
      });
    }
    
    // Check protein
    if (permissions.viewNutrition) {
      const proteinPercent = snapshot.nutrition.protein.consumed / snapshot.nutrition.protein.target;
      if (proteinPercent < 0.7) {
        alerts.push({
          type: 'low_protein',
          severity: 'info',
          message: `Only ${Math.round(proteinPercent * 100)}% of protein target`,
        });
      }
    }
    
    // Check recovery
    if (permissions.viewRecovery && snapshot.health.recoveryScore && snapshot.health.recoveryScore < 50) {
      alerts.push({
        type: 'recovery_low',
        severity: 'warning',
        message: 'Recovery score below 50%',
      });
    }
    
    return alerts;
  }
  
  private mapToCoachingSquad(data: any): CoachingSquad {
    return {
      id: data.id,
      name: data.name,
      coachId: data.coach_id,
      coachName: data.coach_name || '',
      coachAvatar: data.coach_avatar,
      coachCredentials: data.coach_credentials,
      createdAt: data.created_at,
      isActive: data.is_active,
      clientCount: data.client_count || 0,
      maxClients: data.max_clients || 10,
    };
  }
  
  private mapToCoachingClient(data: any): CoachingClient {
    return {
      id: data.id,
      squadId: data.squad_id,
      userId: data.user_id,
      userName: data.users?.name || data.user_name || '',
      userAvatar: data.users?.avatar_url,
      joinedAt: data.joined_at || data.created_at,
      permissions: data.permissions || DEFAULT_CLIENT_PERMISSIONS,
      lastSyncAt: data.last_sync_at,
      status: data.status,
    };
  }
  
  private mapToCoachMessage(data: any): CoachMessage {
    return {
      id: data.id,
      squadId: data.squad_id,
      clientId: data.client_id,
      coachId: data.coach_id,
      type: data.type,
      content: data.content,
      planCard: data.plan_card,
      macroSuggestion: data.macro_suggestion,
      createdAt: data.created_at,
      readAt: data.read_at,
    };
  }
}

// Export singleton
export const coachingSquadService = new CoachingSquadServiceClass();
export default coachingSquadService;
