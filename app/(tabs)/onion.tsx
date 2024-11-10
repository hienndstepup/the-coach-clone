import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const api = axios.create({
  baseURL: "https://mvp-api.hacknao.edu.vn",
});

export default function TabTwoScreen() {
  const [data, setData] = useState<any>(null);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get(
        "api/v1/demos?campaign_id=11009cf2-97a1-423c-9b7d-5dbea1409a13&user_id=040a4c34-e88c-41b6-8cf1-9731613d4269"
      );
      setData(response.data.demos);
    } catch (error) {}
  };

  const handleItemClick = (item: any) => {
    router.push({
      pathname: "/onion-conversation",
      params: { id: item.id },
    });
  };

  return (
    <SafeAreaView>
      <ThemedView style={{ height: "100%", padding: 16 }}>
        <ThemedText style={styles.title}>Danh sách Onion</ThemedText>
        <ThemedView style={styles.container}>
          <FlatList
            data={data || []}
            numColumns={2}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleItemClick(item)}
                style={{
                  flex: 1,
                }}
              >
                <ImageBackground
                  source={{ uri: item.data.background_image }}
                  style={styles.itemContainer}
                  resizeMode="cover"
                >
                  <LinearGradient
                    colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.8)"]}
                    style={styles.gradient}
                  />
                  <ThemedText style={styles.itemTitle}>
                    {item.data.title}
                  </ThemedText>
                </ImageBackground>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => index.toString()}
            columnWrapperStyle={styles.row}
          />
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  itemContainer: {
    position: "relative",
    flex: 1,
    margin: 5,
    padding: 8,
    alignItems: "center",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flex: 1,
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    position: "absolute",
    bottom: 8,
    left: 8,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
