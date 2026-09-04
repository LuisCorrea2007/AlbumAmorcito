import React, { useState, useCallback, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { io, Socket } from 'socket.io-client';
import { useMoodStore } from '../store/mood.store';

// ============================================
// Types
// ============================================

interface ThinkingButtonProps {
  size?: number;
  onSend?: () => void;
  disabled?: boolean;
  partnerOnline?: boolean;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

// ============================================
// Constants
// ============================================

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 120;
const HEART_SCALE = 1.2;
const PARTICLE_COUNT = 12;

// Haptic feedback options
const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

// Socket connection (singleton)
let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:3000', {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: {
        userId: 'current-user-id', // Replace with actual user ID from auth store
      },
    });
  }
  return socket;
};

// ============================================
// Main Component
// ============================================

export const ThinkingButton: React.FC<ThinkingButtonProps> = ({
  size = BUTTON_SIZE,
  onSend,
  disabled = false,
  partnerOnline = false,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);
  const rotation = useSharedValue(0);

  const { receivedThinking, addThinking } = useMoodStore();

  // Listen for incoming "thinking" events from partner
  useEffect(() => {
    const currentSocket = getSocket();

    currentSocket.on('thinking:received', (data) => {
      handleReceiveThinking(data);
    });

    currentSocket.on('thinking:acknowledged', (data) => {
      console.log('Thinking acknowledged by server:', data);
    });

    return () => {
      currentSocket.off('thinking:received');
      currentSocket.off('thinking:acknowledged');
    };
  }, []);

  const handleReceiveThinking = useCallback((data: any) => {
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    
    // Show particles animation
    triggerParticles();
    
    // Add to store for UI notification
    addThinking({
      from: data.from,
      message: data.message,
      timestamp: data.timestamp,
    });

    console.log('Received thinking from:', data.from);
  }, [addThinking]);

  const triggerParticles = useCallback(() => {
    setShowParticles(true);
    
    // Generate random particles
    const newParticles: Particle[] = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      scale: 0.5 + Math.random() * 1,
      rotation: Math.random() * 360,
    }));
    
    setParticles(newParticles);
    
    // Hide particles after animation
    setTimeout(() => {
      setShowParticles(false);
      setParticles([]);
    }, 2000);
  }, []);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Animate button press
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
    heartScale.value = withSpring(1.3, { damping: 10, stiffness: 200 });
    glowOpacity.value = withTiming(1, { duration: 200 });
  }, [disabled, scale, heartScale, glowOpacity]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    
    setIsPressed(false);
    
    // Animate button release with bounce
    scale.value = withSequence(
      withSpring(1.1, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    );
    heartScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    glowOpacity.value = withTiming(0.6, { duration: 300 });
    
    // Trigger haptic feedback
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    
    // Send thinking event via socket
    sendThinkingEvent();
    
    // Trigger particles on sender's screen too
    triggerParticles();
    
    // Call optional callback
    onSend?.();
  }, [disabled, scale, heartScale, glowOpacity, onSend, triggerParticles]);

  const sendThinkingEvent = useCallback(() => {
    const currentSocket = getSocket();
    
    currentSocket.emit('thinking:send', {
      message: 'Pensando en ti 💕',
      timestamp: new Date().toISOString(),
    });
    
    console.log('Sent thinking event');
  }, []);

  // Button animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const rotateAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      {/* Particles Overlay */}
      {showParticles && (
        <View style={styles.particlesContainer}>
          {particles.map((particle) => (
            <Particle key={particle.id} particle={particle} />
          ))}
        </View>
      )}

      {/* Glow Effect */}
      <Animated.View
        style={[
          styles.glow,
          { 
            width: size * 1.5, 
            height: size * 1.5,
            opacity: partnerOnline ? 0.6 : 0.3 
          },
          glowAnimatedStyle,
        ]}
      />

      {/* Main Button */}
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          { width: size, height: size },
          buttonAnimatedStyle,
        ]}
      >
        {/* Lottie Heart Animation */}
        <Animated.View style={[styles.heartContainer, heartAnimatedStyle]}>
          <LottieView
            source={require('../assets/lottie/thinking.json')}
            autoPlay
            loop
            style={styles.lottie}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Online Indicator */}
        {partnerOnline && (
          <View style={styles.onlineIndicator}>
            <View style={styles.onlineDot} />
          </View>
        )}
      </TouchableOpacity>

      {/* Label */}
      <Text style={styles.label}>
        {partnerOnline ? '¡Toca para enviar!' : 'Esperando conexión...'}
      </Text>
    </View>
  );
};

// ============================================
// Particle Component
// ============================================

const Particle: React.FC<{ particle: Particle }> = React.memo(({ particle }) => {
  const fadeOut = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    fadeOut.value = withTiming(0, { duration: 2000 });
    translateY.value = withTiming(-100, { duration: 2000 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOut.value,
    transform: [
      { translateY: translateY.value },
      { scale: particle.scale },
      { rotate: `${particle.rotation}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
        },
        animatedStyle,
      ]}
    >
      <LottieView
        source={require('../assets/lottie/particles.json')}
        autoPlay
        loop={false}
        style={styles.particleLottie}
        resizeMode="contain"
      />
    </Animated.View>
  );
});

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  glow: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: '#FF6B6B',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  button: {
    borderRadius: 9999,
    backgroundColor: '#FFF5F5',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFD7D7',
  },
  heartContainer: {
    width: '70%',
    height: '70%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: '100%',
    height: '100%',
  },
  onlineIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  label: {
    marginTop: 16,
    fontSize: 16,
    color: '#8B7355',
    fontWeight: '500',
    textAlign: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
    zIndex: 9999,
  },
  particle: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  particleLottie: {
    width: '100%',
    height: '100%',
  },
});

export default ThinkingButton;
