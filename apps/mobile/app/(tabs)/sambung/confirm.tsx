import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getQuote, createRemittance } from "../../services/api";

export default function ConfirmScreen() {
  const { nmid, merchantName, amount } = useLocalSearchParams<{
    nmid: string;
    merchantName: string;
    amount: string;
  }>();
  const router = useRouter();
  const [usdcAmount, setUsdcAmount] = useState(amount || "");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const parsed = parseFloat(usdcAmount);
    if (!parsed || parsed <= 0) {
      Alert.alert("Error", "Masukkan jumlah yang valid");
      return;
    }

    setLoading(true);
    try {
      const quote = await getQuote({ nmid, usdcAmount: parsed });
      const remittance = await createRemittance({
        quoteId: quote.quoteId,
        nmid,
        usdcAmount: parsed,
      });

      router.replace({
        pathname: "/(tabs)/sambung/success",
        params: {
          remittanceId: remittance.id,
          usdcAmount: remittance.usdcAmount,
          idrtAmount: remittance.idrtAmount,
          reference: remittance.reference,
          status: remittance.status,
        },
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Gagal mengirim";
      Alert.alert("Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Konfirmasi</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Tujuan</Text>
        <Text style={styles.value}>
          {merchantName || "Merchant QRIS"}
        </Text>
        <Text style={styles.nmid}>NMID: {nmid}</Text>
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
      </View>

      <TouchableOpacity
        style={[styles.sendButton, loading && styles.disabled]}
        onPress={handleSend}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.sendButtonText}>Kirim</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  back: { fontSize: 16, color: "#4CAF50", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: "#1a1a1a", marginBottom: 24 },
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
  value: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  nmid: { fontSize: 14, color: "#999", marginTop: 4 },
  input: {
    fontSize: 28,
    fontWeight: "600",
    color: "#1a1a1a",
    padding: 0,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  sendButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  disabled: { opacity: 0.6 },
});
