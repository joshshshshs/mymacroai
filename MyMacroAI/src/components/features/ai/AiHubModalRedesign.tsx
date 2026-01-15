/**
 * AI Hub Modal - Mockup Match
 * Full-screen assistant entry with pastel gradient, orb hero, and tool cards.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { RADIUS, SHADOWS, SPACING } from '../../../design-system/tokens';
import { useOmniLogger } from '../../../../hooks/useOmniLogger';

interface AiHubModalProps {
  visible: boolean;
  onClose: () => void;
}

type GlyphName = 'voice' | 'scan' | 'barcode' | 'water' | 'weight';

const SMART_TOOLS: Array<{ id: GlyphName; label: string; colors: [string, string] }> = [
  {
    id: 'voice',
    label: 'Voice Log',
    colors: ['#FDBA74', '#F97316'],
  },
  {
    id: 'scan',
    label: 'Meal Scan',
    colors: ['#FCA5A5', '#F43F5E'],
  },
  {
    id: 'barcode',
    label: 'Barcode',
    colors: ['#67E8F9', '#22D3EE'],
  },
];

const TRACK_CARDS: Array<{ id: GlyphName; title: string; subtitle: string; colors: [string, string] }> = [
  {
    id: 'water',
    title: 'Water',
    subtitle: 'Daily water intake goals',
    colors: ['#7DD3FC', '#38BDF8'],
  },
  {
    id: 'weight',
    title: 'Weight',
    subtitle: 'Daily weight updates',
    colors: ['#86EFAC', '#22C55E'],
  },
];

const GlyphIcon = ({ name, color = '#FFFFFF' }: { name: GlyphName; color?: string }) => {
  switch (name) {
    case 'voice':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="9" y="4.5" width="6" height="9" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <Path d="M6 11.5v1a6 6 0 0 0 12 0v-1" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M12 17.5v2.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M9 20h6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case 'scan':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path d="M8.5 8l1.5-2h4l1.5 2" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
          <Rect x="4" y="8" width="16" height="10" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <Circle cx="12" cy="13" r="3" stroke={color} strokeWidth="2" fill="none" />
        </Svg>
      );
    case 'barcode':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="4" y="6" width="2" height="12" rx="1" fill={color} />
          <Rect x="7" y="6" width="1" height="12" rx="0.5" fill={color} />
          <Rect x="9" y="6" width="2" height="12" rx="1" fill={color} />
          <Rect x="12" y="6" width="1" height="12" rx="0.5" fill={color} />
          <Rect x="14" y="6" width="2" height="12" rx="1" fill={color} />
          <Rect x="17" y="6" width="1" height="12" rx="0.5" fill={color} />
          <Rect x="19" y="6" width="2" height="12" rx="1" fill={color} />
        </Svg>
      );
    case 'water':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3c-3 4-5.5 7-5.5 10.2a5.5 5.5 0 0 0 11 0C17.5 10 15 7 12 3z"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      );
    case 'weight':
      return (
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          <Rect x="5" y="6" width="14" height="12" rx="3" stroke={color} strokeWidth="2" fill="none" />
          <Circle cx="12" cy="11" r="2.2" stroke={color} strokeWidth="2" fill="none" />
          <Path d="M12 11v3" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      );
    default:
      return null;
  }
};

const CloseGlyph = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

const CrownGlyph = ({ color }: { color: string }) => (
  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 17h16l-2-8-4 4-4-6-4 6-4-4 2 8z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
    <Path d="M6 17h12" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
  </Svg>
);

const SparkleGlyph = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4L12 3z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
      fill="none"
    />
  </Svg>
);

const ArrowUpGlyph = ({ color }: { color: string }) => (
  <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
    <Path d="M12 18V6" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    <Path d="M8 10l4-4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </Svg>
);

export const AiHubModalRedesign: React.FC<AiHubModalProps> = ({ visible, onClose }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    startListening,
    stopListening,
    isListening,
    isProcessing,
    isExecuting,
    recordingText,
  } = useOmniLogger();
  const fallbackTop = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 0);
  const topInset = insets.top > 0 ? insets.top : fallbackTop;
  const topPadding = topInset + SPACING.lg;
  const contentBottomPadding = Math.max(SPACING.xl, insets.bottom + SPACING.lg);
  const isVoiceBusy = isListening || isProcessing || isExecuting;

  const handleVoiceToggle = async () => {
    if (isVoiceBusy) {
      await stopListening();
      return;
    }
    await startListening();
  };

  const handleToolPress = async (toolId: GlyphName) => {
    if (toolId === 'voice') {
      await handleVoiceToggle();
      return;
    }
    if (toolId === 'scan') {
      onClose();
      router.push({ pathname: '/(modals)/scan', params: { mode: 'vision' } });
      return;
    }
    if (toolId === 'barcode') {
      onClose();
      router.push({ pathname: '/(modals)/scan', params: { mode: 'barcode' } });
    }
  };

  const handleTrackPress = (trackId: GlyphName) => {
    if (trackId === 'water') {
      onClose();
      router.push('/(tabs)/dashboard');
      return;
    }
    if (trackId === 'weight') {
      onClose();
      router.push('/(tabs)/health');
    }
  };

  const askLabel = recordingText
    ? recordingText
    : isListening
      ? 'Listening...'
      : isProcessing
        ? 'Processing...'
        : 'Tap to Ask...';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.screen}>
        <LinearGradient
          colors={['#F6F7FF', '#E9D9FF', '#D6ECFF', '#D6F3EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.blob, styles.blobTopLeft]} />
        <View style={[styles.blob, styles.blobMidRight]} />
        <View style={[styles.blob, styles.blobTopRight]} />
        <View style={[styles.blob, styles.blobBottom]} />

        <SafeAreaView style={[styles.safeArea, { paddingTop: topPadding }]} edges={[]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
              <CloseGlyph color="#111827" />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.9}>
              <LinearGradient
                colors={['#C084FC', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.proPill}
              >
                <CrownGlyph color="#FFFFFF" />
                <Text style={styles.proText}>Pro</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: contentBottomPadding }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.orbWrap}>
              <View style={styles.orbPill} />
              <View style={styles.orbGlow} />
              <View style={styles.orbRing} />
              <LinearGradient
                colors={['#E8FFF0', '#BFEAD0', '#89D8A7']}
                start={{ x: 0.2, y: 0.1 }}
                end={{ x: 0.8, y: 0.9 }}
                style={styles.orb}
              />
              <View style={styles.orbHighlight} />
            </View>

            <Text style={styles.title}>
              AI-Powered Food Calories{'\n'}& Health Assistant
            </Text>

            <TouchableOpacity style={styles.askBar} activeOpacity={0.9} onPress={handleVoiceToggle}>
              <LinearGradient
                colors={['#7C3AED', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.askIcon}
              >
                <SparkleGlyph color="#FFFFFF" />
              </LinearGradient>
              <Text style={styles.askPlaceholder} numberOfLines={1}>
                {askLabel}
              </Text>
              <View style={styles.askSend}>
                <ArrowUpGlyph color="#7C3AED" />
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Smart Logging Tools</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.toolsRow}
            >
              {SMART_TOOLS.map((tool) => (
                <TouchableOpacity
                  key={tool.id}
                  style={styles.toolCard}
                  activeOpacity={0.9}
                  onPress={() => handleToolPress(tool.id)}
                >
                  <LinearGradient
                    colors={tool.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.toolIcon,
                      { shadowColor: tool.colors[1] }
                    ]}
                  >
                    <GlyphIcon name={tool.id} />
                  </LinearGradient>
                  <Text style={styles.toolLabel}>{tool.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>Stay On Track</Text>

            <View style={styles.trackRow}>
              {TRACK_CARDS.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={styles.trackCard}
                  activeOpacity={0.9}
                  onPress={() => handleTrackPress(card.id)}
                >
                  <LinearGradient
                    colors={card.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.trackIcon, { shadowColor: card.colors[1] }]}
                  >
                    <GlyphIcon name={card.id} />
                  </LinearGradient>
                  <View style={styles.trackText}>
                    <Text style={styles.trackTitle}>{card.title}</Text>
                    <Text style={styles.trackSubtitle}>{card.subtitle}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 12 }} />
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7FF',
  },
  safeArea: {
    flex: 1,
  },
  blob: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    opacity: 0.6,
  },
  blobTopLeft: {
    top: -170,
    left: -160,
    backgroundColor: '#E6DBFF',
  },
  blobTopRight: {
    top: 120,
    right: -170,
    backgroundColor: '#DCE9FF',
    opacity: 0.55,
  },
  blobMidRight: {
    top: 260,
    right: -140,
    backgroundColor: '#E1ECF9',
    opacity: 0.7,
  },
  blobBottom: {
    bottom: -220,
    left: -140,
    backgroundColor: '#CFE7FF',
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 0,
    paddingBottom: SPACING.md,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.05)',
    ...SHADOWS.sm,
  },
  proPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  proText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
  },
  orbWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  orb: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  orbGlow: {
    position: 'absolute',
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: 'rgba(126, 217, 166, 0.25)',
  },
  orbRing: {
    position: 'absolute',
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 12,
    borderColor: 'rgba(126, 217, 166, 0.18)',
  },
  orbHighlight: {
    position: 'absolute',
    width: 44,
    height: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.75)',
    top: 12,
    left: 26,
    transform: [{ rotate: '-18deg' }],
  },
  orbPill: {
    position: 'absolute',
    width: 48,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    top: -10,
    left: 20,
    transform: [{ rotate: '-12deg' }],
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'left',
    lineHeight: 28,
    marginBottom: SPACING.md,
  },
  askBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.pill,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(17,24,39,0.06)',
    ...SHADOWS.sm,
  },
  askIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askPlaceholder: {
    flex: 1,
    marginLeft: 10,
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  askSend: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,58,237,0.18)',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: SPACING.sm,
  },
  toolsRow: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
    paddingRight: SPACING['2xl'],
  },
  toolCard: {
    width: 132,
    height: 142,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: SPACING.md,
    justifyContent: 'space-between',
    ...SHADOWS.sm,
  },
  toolIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  toolLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  trackRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  trackCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 68,
    ...SHADOWS.sm,
  },
  trackIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  trackText: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  trackSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
});
