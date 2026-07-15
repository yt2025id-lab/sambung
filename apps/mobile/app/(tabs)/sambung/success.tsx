import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function SuccessScreen() {
  const { remittanceId, usdcAmount, idrtAmount, reference, status } =
    useLocalSearchParams<{
      remittanceId: string;
      usdcAmount: string;
      idrtAmount: string;
      reference: string;
      status: string;
    }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.icon}>✅</View>
      <Text style={styles.title}>Transaksi Berhasil</Text>
      <Text style={styles.subtitle}>Uang sedang diproses ke penerima</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>ID Transaksi</Text>
          <Text style={styles.value}>{remittanceId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Referensi</Text>
          <Text style={styles.value}>{reference}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Jumlah</Text>
          <Text style={styles.value}>{usdcAmount} USDC</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Setara</Text>
          <Text style={styles.value}>Rp {Number(idrtAmount).toLocaleString("id-ID")}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.status]}>{status}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/(tabs)/sambung")}
      >
        <Text style={styles.buttonText}>Kirim Lagi</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.historyButton}
        onPress={() => router.replace("/(tabs)/sambung/history")}
      >
        <Text style={styles.historyText}>Lihat Riwayat</Text>
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
    alignItems: "center",
  },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8, marginBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: { fontSize: 14, color: "#666" },
  value: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  status: { color: "#4CAF50" },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    width: "100%",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  historyButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  historyText: { color: "#4CAF50", fontSize: 16, fontWeight: "500" },
});
