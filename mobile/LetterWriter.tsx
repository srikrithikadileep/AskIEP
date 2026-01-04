
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { PenTool, Sparkles, ChevronRight, Mail } from 'lucide-react-native';

export default function MobileLetterWriter({ childId }: { childId: string }) {
  const templates = [
    { title: 'Request Evaluation', desc: 'Ask for initial testing' },
    { title: 'IEE Request', desc: 'Independent eval at public expense' },
    { title: 'Meeting Request', desc: 'Call an IEP team review' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Letter Writer</Text>
        <Text style={styles.subtitle}>Draft formal IDEA requests</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Templates</Text>
        {templates.map((t, i) => (
          <TouchableOpacity key={i} style={styles.templateCard}>
            <View style={styles.iconCircle}>
              <PenTool size={20} color="#4F46E5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.templateTitle}>{t.title}</Text>
              <Text style={styles.templateDesc}>{t.desc}</Text>
            </View>
            <ChevronRight size={18} color="#CBD5E1" />
          </TouchableOpacity>
        ))}

        <View style={styles.aiBox}>
          <Sparkles size={24} color="#FFF" />
          <Text style={styles.aiTitle}>Smart Draft</Text>
          <Text style={styles.aiDesc}>Tell the AI what you need to say, and it will draft the legal version.</Text>
          <TouchableOpacity style={styles.aiBtn}>
            <Text style={styles.aiBtnText}>Start New Draft</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F8FAFC' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  sectionTitle: { fontSize: 12, fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 12 },
  templateCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F7FF', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  templateTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  templateDesc: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  aiBox: { backgroundColor: '#1E293B', borderRadius: 24, padding: 24, marginTop: 24 },
  aiTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', marginTop: 12 },
  aiDesc: { color: '#94A3B8', fontSize: 12, marginTop: 4, lineHeight: 18 },
  aiBtn: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 12, marginTop: 20, alignItems: 'center' },
  aiBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13 }
});
