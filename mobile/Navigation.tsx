
import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { LayoutDashboard, FileSearch, PenTool, MessageSquare } from 'lucide-react-native';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomTabs({ activeTab, onTabChange }: Props) {
  return (
    <View style={styles.container}>
      <TabItem 
        icon={LayoutDashboard} 
        label="Home" 
        active={activeTab === 'Home'} 
        onPress={() => onTabChange('Home')} 
      />
      <TabItem 
        icon={FileSearch} 
        label="Analyze" 
        active={activeTab === 'Analyze'} 
        onPress={() => onTabChange('Analyze')} 
      />
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
          <MessageSquare size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.fabLabel}>AI Chat</Text>
      </View>
      <TabItem 
        icon={PenTool} 
        label="Letters" 
        active={activeTab === 'Letters'} 
        onPress={() => onTabChange('Letters')} 
      />
      <TabItem 
        icon={MessageSquare} 
        label="Lab" 
        active={activeTab === 'Lab'} 
        onPress={() => onTabChange('Lab')} 
      />
    </View>
  );
}

function TabItem({ icon: Icon, label, active, onPress }: any) {
  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
      <Icon size={20} color={active ? '#4F46E5' : '#94A3B8'} strokeWidth={active ? 2.5 : 2} />
      <Text style={[styles.tabLabel, { color: active ? '#4F46E5' : '#94A3B8' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: 'row', 
    backgroundColor: '#FFF', 
    paddingTop: 12, 
    paddingBottom: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#F1F5F9',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  fabContainer: { flex: 1, alignItems: 'center', marginTop: -30 },
  fab: { 
    width: 52, 
    height: 52, 
    borderRadius: 26, 
    backgroundColor: '#4F46E5', 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#FFF'
  },
  fabLabel: { fontSize: 10, fontWeight: '900', marginTop: 4, color: '#4F46E5' }
});
