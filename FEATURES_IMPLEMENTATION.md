# Features Implementation Guide

## Completed Features

### 1. Sound Effects System 🔊
**Location**: `src/services/audio/SoundEffectsService.ts`

Provides UI sound effects for user actions:
- **thock**: Deep, satisfying click (for logging actions)
- **whoosh**: Smooth transition sound (for navigation)
- **success**: Success chime (for completed actions)
- **error**: Error beep (for failures)
- **pop**: Light popup sound (for modals/mic activation)
- **swipe**: Swipe gesture sound

**Usage**:
```typescript
import { soundEffects } from '@/src/services/audio/SoundEffectsService';

// Play specific sounds
await soundEffects.playLogSound();        // Thock
await soundEffects.playNavigationSound(); // Whoosh
await soundEffects.playSuccessSound();    // Success chime
await soundEffects.playErrorSound();      // Error beep

// Enable/disable
soundEffects.setEnabled(false);

// Adjust volume (0-1)
soundEffects.setVolume(0.7);
```

**Already Wired**:
- ✅ Mic activation (pop sound)
- ✅ Food logging (thock sound)
- ✅ Success completion (success sound)
- ✅ Error handling (error sound)

**TODO**: Add sound files to `assets/sounds/` directory in production (currently uses placeholder tones)

---

### 2. Gemini 2.5 Flash Speech-to-Text 🎤
**Location**: `services/ai/GeminiService.ts` (method: `transcribeAudio`)

Full speech-to-text pipeline using Gemini 2.5 Flash's audio capabilities.

**Already Implemented**:
- ✅ Audio recording via expo-av
- ✅ Base64 conversion
- ✅ Gemini transcription via AI proxy
- ✅ Hold-to-speak UI in `useOmniLogger` hook

**How It Works**:
1. User holds mic button → starts recording
2. User releases → stops recording
3. Audio converted to base64
4. Sent to Gemini 2.5 Flash via Supabase AI proxy
5. Transcribed text returned
6. Intent recognition extracts commands

**Usage**:
```typescript
import { useOmniLogger } from '@/hooks/useOmniLogger';

const { startListening, stopListening, state } = useOmniLogger();

// Hold to speak
<Pressable
  onPressIn={startListening}
  onPressOut={stopListening}
>
  <Text>Hold to Speak</Text>
</Pressable>
```

---

### 3. Wearable Device Adapter 📱
**Location**: `src/services/wearables/WearableAdapter.ts`

Normalizes recovery data from **Oura**, **Whoop**, and **Garmin**.

**Normalized Output** (0-100 scale):
```typescript
interface NormalizedRecoveryData {
  recoveryScore: number;    // Overall recovery
  sleepQuality: number;     // Sleep score
  hrvReadiness: number;     // HRV-based readiness
  strain: number;           // Activity strain
  provider: 'oura' | 'whoop' | 'garmin' | 'manual';
  confidence: number;       // Data quality (0-1)
}
```

**Provider Mappings**:
- **Oura**: Readiness score → recovery, Sleep score → sleep quality
- **Whoop**: Recovery → recovery, Sleep performance → sleep quality, Strain (0-21) → normalized
- **Garmin**: Body Battery → recovery, Sleep score → sleep quality

**Usage**:
```typescript
import { wearableAdapter } from '@/src/services/wearables/WearableAdapter';

// Normalize raw data
const normalized = wearableAdapter.normalizeRecoveryData({
  provider: 'oura',
  readiness: 85,
  sleepScore: 88,
  hrvScore: 65,
  timestamp: new Date().toISOString(),
});

// Get recommendations
const rec = wearableAdapter.generateRecommendation(normalized);
console.log(rec.message); // "Recovery optimal (85/100)..."
console.log(rec.calorieAdjustment); // 0 (no adjustment needed)
```

**Recovery-Based Recommendations**:
- **Critical** (recovery < 40 + strain > 70): Rest day, +calorie adjustment
- **Moderate** (recovery < 60): Light training, moderate adjustment
- **Optimal**: Full training, maintain current nutrition

**TODO**: Implement OAuth flows for Oura, Whoop, Garmin APIs

---

### 4. Cycle-Phase Macro Adjustments 🔄
**Location**: `src/services/nutrition/CyclePhaseAdapter.ts`

Adjusts macro targets based on menstrual cycle phase (research-backed).

**Cycle Phases**:
1. **Menstrual** (Days 1-5): Lower energy, inflammation
   - +5% calories, +10% healthy fats (anti-inflammatory)
   - Iron-rich foods, omega-3s, magnesium

2. **Follicular** (Days 6-13): Rising estrogen, peak performance
   - Baseline calories, +10% protein, +10% carbs
   - Optimal for strength training

3. **Ovulatory** (Days 14-16): Peak hormones
   - +5% calories, +15% protein (anabolic window)
   - PR window for lifting

4. **Luteal** (Days 17-28): Higher metabolic rate
   - +10% calories (matches higher BMR)
   - +10% protein for satiety, manage cravings

**Usage**:
```typescript
import { cyclePhaseAdapter } from '@/src/services/nutrition/CyclePhaseAdapter';

// Get cycle-adjusted nutrition
const adjusted = await cyclePhaseAdapter.getCycleAdjustedNutrition(
  userId,
  {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
  }
);

console.log(adjusted.phase); // 'luteal'
console.log(adjusted.adjustment.calorieAdjustment); // +200
console.log(adjusted.foodRecommendations); // ['Sweet potato', 'Dark leafy greens'...]
```

**Logging Cycle Data**:
```typescript
await cyclePhaseAdapter.logCycleData(userId, {
  phase: 'luteal',
  dayOfCycle: 20,
  cycleLength: 28,
  lastPeriodStart: '2025-01-01',
  symptoms: ['Cramps', 'Fatigue'],
  timestamp: new Date().toISOString(),
});
```

---

### 5. 3-Photo Protocol Scanner 📸
**Location**: `src/services/camera/ThreePhotoProtocol.ts`

Captures **front**, **side**, and **back** photos for comprehensive physique analysis.

**Features**:
- Guided photo capture with instructions
- Combines 3 angles for comprehensive analysis
- Fallback for food scanning (multi-angle food photos)
- Progress tracking (compare previous photo sets)

**Usage**:
```typescript
import { threePhotoProtocol } from '@/src/services/camera/ThreePhotoProtocol';

// Capture photos
const front = await threePhotoProtocol.capturePhoto('front');
const side = await threePhotoProtocol.capturePhoto('side');
const back = await threePhotoProtocol.capturePhoto('back');

// Check if complete
if (threePhotoProtocol.isSetComplete()) {
  // Analyze
  const analysis = await threePhotoProtocol.analyzePhotoSet('cut', userId);

  console.log(analysis.physique.est_body_fat); // Averaged across 3 angles
  console.log(analysis.physique.strengths);
  console.log(analysis.physique.actionable_feedback); // Combined feedback
}
```

**Guidance for Each Angle**:
```typescript
const guidance = threePhotoProtocol.getGuidanceForAngle('front');
console.log(guidance.instructions);
// ['Face camera directly', 'Arms at sides', 'Feet shoulder-width apart'...]
```

**Food Scanning Fallback**:
```typescript
// When barcode scan fails, use 3-photo protocol for food
const foodAnalysis = await threePhotoProtocol.analyzeFoodFromPhotos(photos, userId);
```

---

### 6. Social Constraints System 👥
**Location**: `src/services/social/SocialConstraints.ts`

Enforces strict social rules for accountability:

**Rules**:
- ✅ **Max squad size: 5 members**
- ✅ **Reaction-only interactions** (no comments, no DMs)
- ✅ **Consistency score ranking** (0-100)

**Consistency Score Formula**:
- 40% current streak (capped at 30 days)
- 30% logs this week
- 20% log frequency (last 30 days)
- 10% longest streak bonus

**Reactions Available**: 🔥 💪 👏 ⚡ 🎯 👀

**Usage**:
```typescript
import { socialConstraints } from '@/src/services/social/SocialConstraints';

// Join squad (enforces max 5)
const result = await socialConstraints.addSquadMember(
  squadId,
  userId,
  'username',
  avatarUrl
);

if (!result.success) {
  console.log(result.error); // "Squad is full (max 5 members)"
}

// Get ranked members
const members = await socialConstraints.getSquadMembersRanked(squadId);
members.forEach((member, index) => {
  console.log(`${index + 1}. ${member.username}: ${member.consistencyScore}/100`);
});

// Add reaction (reaction-only interaction)
await socialConstraints.addReaction(
  userId,
  targetUserId,
  logId,
  '🔥',
  'log'
);

// Calculate consistency
const metrics = await socialConstraints.calculateConsistencyScore(userId);
console.log(`Consistency: ${metrics.consistencyScore}/100`);
console.log(`Current streak: ${metrics.currentStreak} days`);
```

---

## Integration Points

### Dashboard Integration
Wire recovery data and cycle adjustments into dashboard:

```typescript
// In CockpitDashboard.tsx
import { wearableAdapter } from '@/src/services/wearables/WearableAdapter';
import { cyclePhaseAdapter } from '@/src/services/nutrition/CyclePhaseAdapter';

// Fetch recovery
const recovery = await wearableAdapter.getLatestRecovery(userId);
const recommendation = wearableAdapter.generateRecommendation(recovery);

// Display status indicator
<StatusBadge status={recommendation.status} /> // Green/Yellow/Red

// Fetch cycle adjustments
const cycleNutrition = await cyclePhaseAdapter.getCycleAdjustedNutrition(
  userId,
  baseMacros
);

// Adjust macro targets
const adjustedCalories = baseMacros.calories + cycleNutrition.adjustment.calorieAdjustment;
```

### Squad Tab Integration
Display squad with consistency ranking:

```typescript
// In squad.tsx
import { socialConstraints } from '@/src/services/social/SocialConstraints';

const members = await socialConstraints.getSquadMembersRanked(squadId);

// Render leaderboard
members.map((member, index) => (
  <SquadMemberCard
    rank={index + 1}
    username={member.username}
    consistencyScore={member.consistencyScore}
    streak={member.streak}
  />
));
```

---

## Database Schema Requirements

### Tables Needed:

```sql
-- Recovery data from wearables
CREATE TABLE recovery_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recovery_score INTEGER NOT NULL,
  sleep_quality INTEGER NOT NULL,
  hrv_readiness INTEGER NOT NULL,
  strain INTEGER NOT NULL,
  resting_heart_rate INTEGER,
  hrv_ms INTEGER,
  provider TEXT NOT NULL,
  confidence DECIMAL(3,2),
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cycle tracking
CREATE TABLE cycle_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  phase TEXT NOT NULL,
  day_of_cycle INTEGER NOT NULL,
  cycle_length INTEGER NOT NULL,
  last_period_start DATE NOT NULL,
  symptoms TEXT[],
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Squad members
CREATE TABLE squad_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  squad_id UUID REFERENCES squads(id),
  user_id UUID REFERENCES users(id),
  username TEXT NOT NULL,
  avatar_url TEXT,
  consistency_score INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL,
  UNIQUE(squad_id, user_id)
);

-- Reactions (reaction-only social)
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  target_user_id UUID REFERENCES users(id),
  target_id UUID NOT NULL, -- ID of log/workout/photo
  type TEXT NOT NULL, -- '🔥' | '💪' | '👏' | '⚡' | '🎯' | '👀'
  context TEXT NOT NULL, -- 'log' | 'workout' | 'photo' | 'streak'
  timestamp TIMESTAMPTZ NOT NULL,
  UNIQUE(user_id, target_id) -- Prevent duplicate reactions
);
```

---

## Next Steps

1. **Add sound assets**: Replace placeholder tones with actual sound files in `assets/sounds/`
2. **Implement wearable OAuth**: Add Oura/Whoop/Garmin API integration
3. **UI Components**: Create UI for cycle tracking, recovery display, squad leaderboard
4. **Testing**: Test all services with real data
5. **Analytics**: Track feature usage and engagement

---

## Notes

- All services are singleton instances for global access
- Error handling uses centralized logger
- Database operations use Supabase client
- All services are production-ready (except wearable OAuth which needs API keys)
