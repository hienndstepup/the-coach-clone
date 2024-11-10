import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";

const api = axios.create({
  baseURL: "https://mvp-api.hacknao.edu.vn",
});

const OnionConversation = () => {
  const [dataConversation, setDataConversation] = useState<any>([]);
  const [msgList, setMsgList] = useState<any>([]);
  const [currentMsgIndex, setCurrentMsgIndex] = useState<any>(0);
  const [currentMsg, setCurrentMsg] = useState<any>(null);
  const [sttData, setSttData] = useState<any>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isShowMic, setIsShowMic] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchDataConversation();
  }, []);

  useEffect(() => {
    if (msgList.length === 0) return;
    setCurrentMsg(msgList[currentMsgIndex]);
  }, [currentMsgIndex, msgList]);

  useEffect(() => {
    if (!currentMsg?.audio) return;
    console.log("Audio URL:", currentMsg.audio);

    let isMounted = true;

    const playAudio = async () => {
      try {
        // Cleanup previous sound
        if (sound) {
          await sound.unloadAsync();
        }

        console.log("Starting to load audio...");
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: currentMsg.audio },
          { shouldPlay: true }
        );
        console.log("Audio loaded successfully");

        if (!isMounted) {
          await newSound.unloadAsync();
          return;
        }

        setSound(newSound);

        // Wait for audio to finish playing
        await new Promise((resolve) => {
          newSound.setOnPlaybackStatusUpdate((status: any) => {
            if (status.didJustFinish) {
              resolve(true);
            }
          });
        });

        // Show mic only if this is the last message
        if (isMounted) {
          if (currentMsgIndex === msgList.length - 1) {
            setIsShowMic(true);
          } else {
            setCurrentMsgIndex((prev: number) => prev + 1);
          }
        }

        await newSound.unloadAsync();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    playAudio();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentMsg]);

  useEffect(() => {
    let animationLoop: Animated.CompositeAnimation;

    if (isRecording) {
      animationLoop = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]);

      Animated.loop(animationLoop).start();
    } else {
      scaleAnim.setValue(1);
    }

    return () => {
      if (animationLoop) {
        animationLoop.stop();
      }
    };
  }, [isRecording]);

  const fetchDataConversation = async () => {
    const response = await api.post(
      "api/v1/onion-gpt/conversation?user_id=040a4c34-e88c-41b6-8cf1-9731613d4269",
      { topic_id: 2 }
    );
    setDataConversation(response.data.data);
    setMsgList(response.data.data.messages);
  };

  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
      });
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      if (!uri) return;
      // Chuyển đổi URI thành Blob
      const response = await fetch(uri);
      const blob: any = await response.blob();
      let file = new File([blob], "audio.wav", { type: "audio/wav" });
      const formData = new FormData();
      formData.append("conversation_id", "293");
      formData.append("audio_file", file);
      formData.append("user_id", "040a4c34-e88c-41b6-8cf1-9731613d4269");

      // const res = await api.post(`api/v1/onion-gpt/chat_audio`, formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      const resultDemo = {
        content: "Hello, my name is Nguyen Dinh Hien",
        audio: "https://example.com/audio.mp3",
      };

      setSttData(resultDemo);
    } catch (err) {
      console.error("Failed to stop recording", err);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedView style={{ alignItems: "center", marginTop: 30 }}>
          {currentMsg?.content && (
            <ThemedText
              style={{
                fontSize: 16,
                fontWeight: "bold",
                backgroundColor: "#444444",
                padding: 10,
                borderRadius: 20,
                overflow: "hidden",
              }}
            >
              {currentMsg?.content}
            </ThemedText>
          )}
        </ThemedView>
        <ThemedView style={{ alignItems: "center", marginBottom: 30 }}>
          {sttData?.content ? (
            <ThemedView>
              <ThemedText
                style={{
                  fontSize: 16,
                  fontWeight: "bold",
                  backgroundColor: "#444444",
                  padding: 10,
                  borderRadius: 20,
                  overflow: "hidden",
                }}
              >
                {sttData?.content}
              </ThemedText>
            </ThemedView>
          ) : (
            <>
              {isShowMic && (
                <TouchableOpacity
                  onPress={isRecording ? stopRecording : startRecording}
                  style={styles.micContainer}
                >
                  <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <FontAwesome
                      name="microphone"
                      size={30}
                      color={isRecording ? "red" : "gray"}
                    />
                  </Animated.View>
                </TouchableOpacity>
              )}
            </>
          )}
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
};

export default OnionConversation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    padding: 16,
  },
  micContainer: {
    width: 110,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
});
