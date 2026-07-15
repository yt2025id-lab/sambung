import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { getRemittanceHistory } from "../../services/api";
import type { RemittanceResponse } from "../../services/api";

const STATUS_COLORS: Record<string, string> = {
  initiated: "#FFA000",
  swapping: "#1976D2",
  waiting_anchor: "#1976D2",
  settled: "#4CAF50",
  failed: "#F44336",
  refunded: "#9E9E9E",
};

export default function HistoryScreen() {
  const router = useRouter();
  const [remittances, setRemittances] = useState<RemittanceResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getRemittanceHistory()
        .then(setRemittances)
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [])
  );

  const renderItem = ({ item }: { item: RemittanceResponse }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.amount}>{item.usdcAmount} USDC</Text>
        <Text
          style={[styles.status, { color: STATUS_COLORS[item.status] || "#999" }]}
        >
          {item.status}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.nmid}>{item.nmid || item.id}</Text>
        <Text style={styles.idrt}>
          Rp {Number(item.idrtAmount || 0).toLocaleString("id-ID")}
        </Text>
      </View>
      <Text style={styles.date}>
        {new Date(item.createdAt).toLocaleString("id-ID")}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Kembali</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Riwayat Transaksi</Text>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} />
      ) : remittances.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Belum ada transaksi</Text>
        </View>
      ) : (
        <FlatList
          data={remittances}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
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
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amount: { fontSize: 18, fontWeight: "600", color: "#1a1a1a" },
  status: { fontSize: 14, fontWeight: "600", textTransform: "uppercase" },
  nmid: { fontSize: 14, color: "#666" },
  idrt: { fontSize: 14, fontWeight: "600", color: "#1a1a1a" },
  date: { fontSize: 12, color: "#999", marginTop: 4 },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#999" },
});
