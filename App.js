import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { Accelerometer } from "expo-sensors";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Easing,
  TouchableWithoutFeedback,
  Vibration,
} from "react-native";

// Dice images for themes
const diceThemes = {
  classic: {
    1: require("./assets/dice1.png"),
    2: require("./assets/dice2.png"),
    3: require("./assets/dice3.png"),
    4: require("./assets/dice4.png"),
    5: require("./assets/dice5.png"),
    6: require("./assets/dice6.png"),
  },
  yellow: {
    1: require("./assets/yellow-dice1.png"),
    2: require("./assets/yellow-dice2.png"),
    3: require("./assets/yellow-dice3.png"),
    4: require("./assets/yellow-dice4.png"),
    5: require("./assets/yellow-dice5.png"),
    6: require("./assets/yellow-dice6.png"),
  },
};

export default function App() {
  const [diceNumber, setDiceNumber] = useState(1);
  const [theme, setTheme] = useState("classic");
  const [darkMode, setDarkMode] = useState(false);

  // Animations
  const shakeAnimation = new Animated.Value(0);
  const rotateAnimation = new Animated.Value(0);
  const scaleAnimation = new Animated.Value(1);
  const backgroundAnimation = new Animated.Value(0); // Background animation

  useEffect(() => {
    let subscription;
    const subscribeToShake = () => {
      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const acceleration = Math.sqrt(x * x + y * y + z * z);
        if (acceleration > 1.7) {
          rollDice();
        }
      });
    };
    subscribeToShake();
    return () => subscription && subscription.remove();
  }, []);

  const rollDice = async () => {
    const sound = new Audio.Sound();
    try {
      await sound.loadAsync(require("./assets/dice-roll.mp3"));
      await sound.playAsync();
      Vibration.vibrate(100); // Haptic feedback

      const finalNumber = Math.floor(Math.random() * 6) + 1;
      const rollingInterval = setInterval(() => {
        setDiceNumber(Math.floor(Math.random() * 6) + 1);
      }, 120);

      shakeAnimation.setValue(0);
      rotateAnimation.setValue(0);
      scaleAnimation.setValue(1);
      backgroundAnimation.setValue(0); // Reset background animation

      Animated.parallel([
        Animated.sequence([
          Animated.timing(shakeAnimation, { toValue: 6, duration: 200, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: -6, duration: 200, useNativeDriver: true }),
          Animated.timing(shakeAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scaleAnimation, { toValue: 1.05, duration: 200, useNativeDriver: true }),
          Animated.timing(scaleAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
        Animated.timing(backgroundAnimation, { toValue: 1, duration: 500, useNativeDriver: false }), // Animate background
      ]).start(() => {
        clearInterval(rollingInterval);
        setDiceNumber(finalNumber);
      });
    } catch (error) {
      console.log("Error loading or playing sound:", error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Interpolating background color
  const backgroundColor = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: darkMode ? ["#1e1e2e", "#29293d"] : ["#f8f8f8", "#e8e8e8"],
  });

  const rotateInterpolate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "720deg"],
  });

  return (
    <TouchableWithoutFeedback onPress={toggleDarkMode}>
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.title, { color: darkMode ? "#fff" : "#000" }]}>Dice Roller</Text>

        <Animated.View
          style={{
            transform: [
              { translateX: shakeAnimation },
              { translateY: shakeAnimation.interpolate({ inputRange: [-6, 6], outputRange: [-3, 3] }) },
              { rotate: rotateInterpolate },
              { scale: scaleAnimation },
            ],
          }}
        >
          <Image source={diceThemes[theme][diceNumber]} style={styles.diceImage} />
        </Animated.View>

        <TouchableOpacity style={styles.button} onPress={rollDice} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Roll the Dice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.themeButton}
          onPress={() => setTheme(theme === "classic" ? "yellow" : "classic")}
        >
          <Text style={styles.buttonText}>Change Dice</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 30,
  },
  diceImage: {
    width: 160,
    height: 160,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#ff7f50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginTop: 20,
  },
  themeButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
