import { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { resolveQRIS } from "../../services/api";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const router = useRouter();
  const scannedRef = useRef(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Izinkan akses kamera untuk scan QRIS
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (!scanning || scannedRef.current) return;
    scannedRef.current = true;
    setScanning(false);

    try {
      const result = await resolveQRIS(data);

      if (!result.nmid) {
        Alert.alert("QRIS Tidak Valid", "Kode QRIS tidak memiliki NMID.");
        scannedRef.current = false;
        setScanning(true);
        return;
      }

      router.replace({
        pathname: "/(tabs)/sambung/confirm",
        params: {
          nmid: result.nmid,
          merchantName: result.merchantName ?? "",
          amount: result.amount ? String(result.amount) : "",
        },
      });
    } catch {
      Alert.alert("Gagal", "Tidak dapat membaca kode QRIS.");
      scannedRef.current = false;
      setScanning(true);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
      />
      <View style={styles.overlay}>
        <View style={styles.scanBox} />
        <Text style={styles.hint}>Arahkan kamera ke kode QRIS</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Text style={styles.closeText}>Batal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanBox: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  hint: { color: "#fff", marginTop: 24, fontSize: 16 },
  closeButton: { marginTop: 32, padding: 12 },
  closeText: { color: "#fff", fontSize: 16 },
  message: { color: "#fff", fontSize: 16, textAlign: "center", marginBottom: 24 },
  button: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
