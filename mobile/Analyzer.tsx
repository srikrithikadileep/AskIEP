
import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Upload, Sparkles, ShieldCheck, Lock } from 'lucide-react-native';

export default function MobileAnalyzer({ childId }: { childId: string }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI IEP Analyzer</Text>
        <Text style={styles.subtitle}>Securely decrypt your child's goals</Text>
      </View>

      <View style={styles.uploadBox}>
        <View style={styles.iconCircle}>
          <Upload size={32} color="#4F46E5" />
        </View>
        <Text style={styles.uploadTitle}>Upload Document</Text>
        <Text style={styles.uploadDesc}>PDF or Word files supported</Text>
        
        <TouchableOpacity style={styles.btn} onPress={() => setIsAnalyzing(true)}>
          <Text style={styles.btnText}>Choose from Files</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Lock size={16} color="#94A3B8" />
        <Text style={styles.infoText}>Data is processed locally on this device</Text>
      </View>

      {isAnalyzing && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.overlayText}>Consulting Advocacy Engine...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  uploadBox: { backgroundColor: '#FFF', borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  uploadTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  uploadDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4, marginBottom: 24 },
  btn: { backgroundColor: '#4F46E5', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '900', fontSize: 14 },
  infoBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 8 },
  infoText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 23, 42, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  overlayText: { color: '#FFF', marginTop: 16, fontWeight: '800', fontSize: 14 }
});
