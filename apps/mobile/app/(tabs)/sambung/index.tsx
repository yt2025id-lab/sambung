import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getRate } from "../../services/api";
import type { RateResponse } from "../../services/api";

export default function HomeScreen() {
  const router = useRouter();
  const [rate, setRate] = useState<RateResponse | null>(null);
  const [usdcAmount, setUsdcAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRate()
      .then(setRate)
      .catch(() => {});
  }, []);

  const idrtAmount = rate && usdcAmount
    ? (parseFloat(usdcAmount) * rate.rate).toLocaleString("id-ID")
    : "0";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sambung</Text>
        <Text style={styles.subtitle}>Kirim uang ke Indonesia</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Kurs</Text>
        <Text style={styles.rate}>
          1 USDC = Rp{" "}
          {rate ? rate.rate.toLocaleString("id-ID") : "..."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Jumlah (USDC)</Text>
        <TextInput
          style={styles.input}
          value={usdcAmount}
          onChangeText={setUsdcAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor="#999"
        />
        <Text style={styles.equivalent}>
          ≈ Rp {idrtAmount}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, loading && styles.disabled]}
        onPress={() => router.push("/(tabs)/sambung/scan")}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.scanButtonText}>Scan QRIS</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.push("/(tabs)/sambung/history")}
      >
        <Text style={styles.historyText}>Riwayat Transaksi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 80,
  },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 14, color: "#666", marginBottom: 8 },
  rate: { fontSize: 24, fontWeight: "600", color: "#4CAF50" },
  input: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a1a",
    padding: 0,
  },
  equivalent: { fontSize: 16, color: "#666", marginTop: 8 },
  scanButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  scanButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  historyButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  historyText: { color: "#4CAF50", fontSize: 16, fontWeight: "500" },
});
