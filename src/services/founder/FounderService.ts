import { supabase } from '../../lib/supabase';
import { useUserStore } from '@/src/store/UserStore';

class FounderService {

    async claimFounderStatus(email: string): Promise<boolean> {
        try {
            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('send-founder-email', {
                body: { email }
            });

            if (error) {
                console.error("Founder Function Error:", error);
                throw error;
            }

            // In a real flow, the Edge Function might return the "Founder #ID"
            // For now, we still simulate the ID generation locally or parse it from data if available
            // Assuming data contains: { id: ..., message: ... } or similar from Resend

            const randomFounderID = Math.floor(Math.random() * 500) + 1;

            useUserStore.getState().setFounderStatus({
                isFounder: true,
                number: randomFounderID
            });

            return true;

        } catch (error) {
            console.error("Founder Claim Error:", error);
            return false;
        }
    }
}

export const founderService = new FounderService();
