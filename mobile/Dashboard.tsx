
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { ShieldCheck, FileSearch, PenTool, MessageSquare, TrendingUp, Bell } from 'lucide-react-native';
import { ChildProfile } from '../types.ts';

interface Props {
  profile: ChildProfile | null;
}

export default function MobileDashboard({ profile }: Props) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <ShieldCheck size={18} color="#FFF" />
          </View>
          <Text style={styles.logoText}>AskIEP</Text>
          <TouchableOpacity style={styles.notificationBtn}>
            <Bell size={20} color="#64748B" />
          </TouchableOpacity>
        </View>
        <Text style={styles.welcomeText}>Hello, Jane</Text>
        <Text style={styles.subWelcome}>Supporting {profile?.name || 'Student'}'s Growth</Text>
      </View>

      {/* Hero Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Compliance Health</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusBig}>85%</Text>
          <View style={styles.statusBadge}>
            <TrendingUp size={12} color="#10B981" />
            <Text style={styles.statusBadgeText}>+2% vs last month</Text>
          </View>
        </View>
        <View style={styles.progressBar}>
           <View style={[styles.progressFill, { width: '85%' }]} />
        </View>
        <Text style={styles.statusMeta}>Mandated services delivered this month</Text>
      </View>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionTitle}>Advocacy Toolbox</Text>
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#EEF2FF' }]}>
            <FileSearch size={22} color="#4F46E5" />
          </View>
          <Text style={styles.cardTitle}>Analyze IEP</Text>
          <Text style={styles.cardDesc}>Upload new docs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#FFF7ED' }]}>
            <PenTool size={22} color="#EA580C" />
          </View>
          <Text style={styles.cardTitle}>Letter Writer</Text>
          <Text style={styles.cardDesc}>AI Draft requests</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#F0FDF4' }]}>
            <MessageSquare size={22} color="#16A34A" />
          </View>
          <Text style={styles.cardTitle}>Practice Lab</Text>
          <Text style={styles.cardDesc}>Meeting prep</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <View style={[styles.iconBox, { backgroundColor: '#FDF2F8' }]}>
            <TrendingUp size={22} color="#DB2777" />
          </View>
          <Text style={styles.cardTitle}>Progress</Text>
          <Text style={styles.cardDesc}>Track goals</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingBottom: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoBox: { backgroundColor: '#4F46E5', padding: 6, borderRadius: 8, marginRight: 8 },
  logoText: { fontSize: 18, fontWeight: '900', color: '#0F172A', flex: 1 },
  notificationBtn: { padding: 8 },
  welcomeText: { fontSize: 26, fontWeight: '900', color: '#1E293B' },
  subWelcome: { fontSize: 14, color: '#64748B', marginTop: 2 },
  statusCard: { backgroundColor: '#0F172A', padding: 24, borderRadius: 32, margin: 24, marginTop: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  statusTitle: { color: '#94A3B8', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  statusBig: { color: '#FFF', fontSize: 42, fontWeight: '900' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 12 },
  statusBadgeText: { color: '#10B981', fontSize: 10, fontWeight: '800', marginLeft: 4 },
  progressBar: { height: 6, backgroundColor: '#334155', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366F1' },
  statusMeta: { color: '#94A3B8', fontSize: 11, marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1E293B', marginLeft: 24, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  card: { width: '45%', backgroundColor: '#FFF', padding: 16, borderRadius: 24, marginHorizontal: '2.5%', marginBottom: 16, borderWeight: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  cardDesc: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  footerSpacer: { height: 100 }
});
