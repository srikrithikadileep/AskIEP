
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { api } from '../services/apiService.ts';
import { ChildProfile } from '../types.ts';
import MobileDashboard from './Dashboard.tsx';
import MobileAnalyzer from './Analyzer.tsx';
import MobileLetterWriter from './LetterWriter.tsx';
import BottomTabs from './Navigation.tsx';

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('Home');
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const p = await api.getProfile();
        setProfile(p);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'Home': return <MobileDashboard profile={profile} />;
      case 'Analyze': return <MobileAnalyzer childId={profile?.id || ''} />;
      case 'Letters': return <MobileLetterWriter childId={profile?.id || ''} />;
      default: return <MobileDashboard profile={profile} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        {renderContent()}
      </View>
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  content: { flex: 1 },
});
