/**
 * Athlete Profile Types
 * Used for the Edit Profile screen and public Athlete Card
 */

/**
 * Stat visibility toggles for the "Flex Grid"
 * Controls which stats appear on the public Athlete Card
 */
export interface StatVisibility {
    showStreak: boolean;
    showWeight: boolean;
    showConsistency: boolean;
    showBadges: boolean;
    showDeadliftPR: boolean;
}

/**
 * Social media links for the profile
 */
export interface SocialLinks {
    instagram: string;
    tiktok: string;
    website: string;
}

/**
 * Complete Athlete Profile for public display
 */
export interface AthleteProfile {
    displayName: string;
    handle: string;           // @username (unique identifier)
    bio: string;              // max 140 characters
    avatarUri: string | null;
    statVisibility: StatVisibility;
    socialLinks: SocialLinks;
}

/**
 * Default values for new profiles
 */
export const DEFAULT_STAT_VISIBILITY: StatVisibility = {
    showStreak: true,
    showWeight: false,       // Hidden by default for privacy
    showConsistency: true,
    showBadges: true,
    showDeadliftPR: false,
};

export const DEFAULT_SOCIAL_LINKS: SocialLinks = {
    instagram: '',
    tiktok: '',
    website: '',
};

export const DEFAULT_ATHLETE_PROFILE: AthleteProfile = {
    displayName: '',
    handle: '',
    bio: '',
    avatarUri: null,
    statVisibility: DEFAULT_STAT_VISIBILITY,
    socialLinks: DEFAULT_SOCIAL_LINKS,
};
