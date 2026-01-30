import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAds } from '../src/context/AdContext';
import { BannerAd } from '../src/components/BannerAd';
import { submitEpisodeScore, submitMixedScore } from '../src/services/api';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { showRewarded, isRewardedReady } = useAds();
  
  const mode = params.mode as string || 'episode';
  const episodeId = parseInt(params.episodeId as string) || 1;
  const initialScore = parseInt(params.score as string) || 0;
  const correctCount = parseInt(params.correctCount as string) || 0;
  const speedBonus = parseInt(params.speedBonus as string) || 0;
  const totalQuestions = parseInt(params.totalQuestions as string) || 25;
  const questionsAnswered = parseInt(params.questionsAnswered as string) || 0;
  
  // State for score multiplier and submission
  const [currentScore, setCurrentScore] = useState(initialScore);
  const [isMultiplied, setIsMultiplied] = useState(false);
  const [isLoadingRewarded, setIsLoadingRewarded] = useState(false);
  const [isScoreSubmitted, setIsScoreSubmitted] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const multiplierAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Score animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  // Submit score to backend - called when user decides (3X or not)
  const submitFinalScore = async (finalScore: number) => {
    if (isScoreSubmitted || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      let result;
      if (mode === 'mixed') {
        result = await submitMixedScore(finalScore, correctCount, speedBonus, questionsAnswered);
      } else {
        result = await submitEpisodeScore(episodeId, finalScore, correctCount, speedBonus);
      }
      
      setIsScoreSubmitted(true);
      setIsNewRecord(result.is_new_record);
      setBestScore(result.best_score);
      
      // Start sparkle animation if new record
      if (result.is_new_record) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.timing(sparkleAnim, { toValue: 0.5, duration: 500, useNativeDriver: true }),
          ])
        ).start();
      }
      
      console.log(`[Result] Score submitted: ${finalScore}, New Record: ${result.is_new_record}`);
    } catch (e) {
      console.error('[Result] Score submit error:', e);
      setIsScoreSubmitted(true); // Mark as submitted to prevent loops
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle 3X rewarded ad
  const handleWatch3XAd = async () => {
    if (isMultiplied || isLoadingRewarded) return;
    
    setIsLoadingRewarded(true);
    
    const success = await showRewarded(() => {
      // Callback when reward is earned
      const newScore = currentScore * 3;
      setCurrentScore(newScore);
      setIsMultiplied(true);
      
      // Animate the multiplier
      Animated.sequence([
        Animated.timing(multiplierAnim, { toValue: 1.3, duration: 200, useNativeDriver: true }),
        Animated.timing(multiplierAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
      // Submit the MULTIPLIED score to backend
      submitFinalScore(newScore);
    });
    
    setIsLoadingRewarded(false);
    
    if (!success) {
      console.log('Rewarded ad not available or user cancelled');
    }
  };

  // Handle skip 3X and submit original score
  const handleSkip3X = () => {
    if (!isScoreSubmitted && !isMultiplied) {
      submitFinalScore(currentScore);
    }
  };

  const handleNextEpisode = () => {
    // Submit score if not submitted yet
    if (!isScoreSubmitted && !isMultiplied) {
      submitFinalScore(currentScore);
    }
    router.replace(`/quiz?mode=episode&episode=${episodeId + 1}`);
  };

  const handlePlayAgain = () => {
    // Submit score if not submitted yet
    if (!isScoreSubmitted && !isMultiplied) {
      submitFinalScore(currentScore);
    }
    if (mode === 'mixed') {
      router.replace('/quiz?mode=mixed');
    } else {
      router.replace(`/quiz?mode=episode&episode=${episodeId}`);
    }
  };

  const handleLeaderboard = () => {
    // Submit score if not submitted yet
    if (!isScoreSubmitted && !isMultiplied) {
      submitFinalScore(currentScore);
    }
    if (mode === 'mixed') {
      router.push('/leaderboard?tab=mixed');
    } else {
      router.push(`/leaderboard?tab=episode&episode=${episodeId}`);
    }
  };

  const handleHome = () => {
    // Submit score if not submitted yet
    if (!isScoreSubmitted && !isMultiplied) {
      submitFinalScore(currentScore);
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* New Record Badge - Only show after score is submitted */}
        {isScoreSubmitted && isNewRecord && (
          <Animated.View style={[styles.newRecordBadge, { opacity: sparkleAnim }]}>
            <Ionicons name="trophy" size={24} color="#ffc107" />
            <Text style={styles.newRecordText}>YENİ REKOR!</Text>
          </Animated.View>
        )}

        {/* Score with 3X Button */}
        <Animated.View style={[styles.scoreContainer, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={styles.scoreLabel}>SKOR</Text>
          <View style={styles.scoreRow}>
            <Animated.Text style={[
              styles.scoreValue, 
              isMultiplied && styles.scoreMultiplied,
              { transform: [{ scale: multiplierAnim }] }
            ]}>
              {currentScore}
            </Animated.Text>
            
            {/* 3X Rewarded Ad Button - Only show if not multiplied yet */}
            {!isMultiplied && !isScoreSubmitted && (
              <TouchableOpacity 
                style={[
                  styles.multiplierButton,
                  !isRewardedReady && styles.multiplierButtonDisabled
                ]}
                onPress={handleWatch3XAd}
                disabled={isLoadingRewarded || !isRewardedReady}
                activeOpacity={0.8}
              >
                {isLoadingRewarded ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="videocam" size={16} color="#fff" />
                    <Text style={styles.multiplierText}>3X</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            {isMultiplied && (
              <View style={styles.multipliedBadge}>
                <Text style={styles.multipliedText}>3X!</Text>
              </View>
            )}
          </View>
          
          {/* Hint text */}
          {!isMultiplied && !isScoreSubmitted && (
            <Text style={styles.watchAdHint}>Reklam izle, puanını 3 katına çıkar!</Text>
          )}
          
          {/* Skip button - if user doesn't want to watch ad */}
          {!isMultiplied && !isScoreSubmitted && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={handleSkip3X}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>3X'i Atla ve Devam Et</Text>
            </TouchableOpacity>
          )}
          
          {/* Submitting indicator */}
          {isSubmitting && (
            <View style={styles.submittingContainer}>
              <ActivityIndicator size="small" color="#009688" />
              <Text style={styles.submittingText}>Skor kaydediliyor...</Text>
            </View>
          )}
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="checkmark-circle" size={28} color="#4caf50" />
            <Text style={styles.statValue}>{correctCount}</Text>
            <Text style={styles.statLabel}>Doğru</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="flash" size={28} color="#ff9800" />
            <Text style={styles.statValue}>+{speedBonus}</Text>
            <Text style={styles.statLabel}>Hız Bonusu</Text>
          </View>
          
          {mode === 'episode' ? (
            <View style={styles.statItem}>
              <Ionicons name="help-circle" size={28} color="#2196f3" />
              <Text style={styles.statValue}>{correctCount}/{totalQuestions}</Text>
              <Text style={styles.statLabel}>Soru</Text>
            </View>
          ) : (
            <View style={styles.statItem}>
              <Ionicons name="list" size={28} color="#2196f3" />
              <Text style={styles.statValue}>{questionsAnswered}</Text>
              <Text style={styles.statLabel}>Cevaplanan</Text>
            </View>
          )}
        </View>

        {/* Best Score - Only show after submission */}
        {isScoreSubmitted && (
          <View style={styles.bestScoreContainer}>
            <Text style={styles.bestScoreLabel}>
              {mode === 'episode' ? `${episodeId}. Bölüm En İyi Skor` : 'Karışık Mod En İyi'}
            </Text>
            <Text style={styles.bestScoreValue}>{bestScore}</Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {mode === 'episode' && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextEpisode}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
              <Text style={styles.primaryButtonText}>Sonraki Bölüm</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePlayAgain}>
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.secondaryButtonText}>Tekrar Oyna</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton} onPress={handleLeaderboard}>
            <Ionicons name="trophy" size={24} color="#fff" />
            <Text style={styles.secondaryButtonText}>Liderlik Tablosu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.outlineButton} onPress={handleHome}>
            <Ionicons name="home" size={24} color="#009688" />
            <Text style={styles.outlineButtonText}>Ana Menü</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Banner Ad - Always visible */}
      <BannerAd />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newRecordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,193,7,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    marginBottom: 20,
  },
  newRecordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreMultiplied: {
    color: '#4caf50',
  },
  multiplierButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e91e63',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    shadowColor: '#e91e63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  multiplierButtonDisabled: {
    backgroundColor: '#555',
    shadowOpacity: 0,
  },
  multiplierText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  multipliedBadge: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  multipliedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  watchAdHint: {
    fontSize: 12,
    color: '#e91e63',
    marginTop: 8,
    fontWeight: '500',
  },
  skipButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#888',
    textDecorationLine: 'underline',
  },
  submittingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  submittingText: {
    fontSize: 14,
    color: '#009688',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#2d2d44',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  bestScoreContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  bestScoreLabel: {
    fontSize: 14,
    color: '#888',
  },
  bestScoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffc107',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009688',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  outlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#009688',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#009688',
  },
});
