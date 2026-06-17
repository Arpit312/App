import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  Image,
  Alert,
  Animated
} from 'react-native';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function SideDrawer({ isOpen, onClose }: SideDrawerProps) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  const handleItemPress = (title: string, content: string) => {
    Alert.alert(title, content);
  };

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: -DRAWER_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      onRequestClose={handleClose}
      animationType="fade"
    >
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        </TouchableWithoutFeedback>

        {/* Animated Drawer Panel */}
        <Animated.View
          style={{
            width: DRAWER_WIDTH,
            backgroundColor: '#0f172a',
            height: '100%',
            padding: 24,
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 5,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 20, marginBottom: 24, marginTop: 40 }}>
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 100, height: 30 }}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
              <Text style={{ color: '#ea580c', fontSize: 18, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Section title */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold' }}>Menu Navigation</Text>
            <Text style={{ color: '#f8fafc', fontSize: 20, fontWeight: '900', marginTop: 4 }}>Velocity Portal</Text>
          </View>

          {/* Nav Items */}
          <View style={{ flex: 1 }}>
            <TouchableOpacity
              onPress={() => handleItemPress("Customer Care", "Support Email: support@velocity.com\nHotline: 1-800-VELOCITY\n\nOur agents are available 24/7.")}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}
            >
              <Text style={{ fontSize: 22, marginRight: 14 }}>📞</Text>
              <View>
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>Customer Care</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>24/7 Support Center</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleItemPress("About Velocity", "Velocity is a premium clothing, shoes, and lifestyle brand e-commerce platform delivering luxury quality at your fingertips.")}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}
            >
              <Text style={{ fontSize: 22, marginRight: 14 }}>ℹ️</Text>
              <View>
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>About Us</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Our Brand & Values</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleItemPress("Version Information", "Velocity App v1.0.0\nBuild: 1002\nChannel: Beta")}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' }}
            >
              <Text style={{ fontSize: 22, marginRight: 14 }}>⚙️</Text>
              <View>
                <Text style={{ color: '#f8fafc', fontSize: 14, fontWeight: 'bold' }}>Version Info</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>Velocity App Suite</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={{ borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 16 }}>
            <Text style={{ color: '#475569', fontSize: 10, textAlign: 'center', fontWeight: 'bold' }}>
              Velocity Store Premium Edition
            </Text>
            <Text style={{ color: '#475569', fontSize: 9, textAlign: 'center', marginTop: 2 }}>
              © 2026 Velocity Inc. All rights reserved.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
