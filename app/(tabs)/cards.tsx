import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, Image as RNImage } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

interface CardItem {
  id: string;
  name: string;
  imageUri?: string;
}

export default function CardsScreen() {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | undefined>(undefined);
  const [permissionStatus, requestPermission] = ImagePicker.useMediaLibraryPermissions();
  const [viewerUri, setViewerUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setNewName('');
        setNewImageUri(undefined);
        setModalVisible(false);
      };
    }, [])
  );

  const requestMediaPermission = useCallback(async () => {
    if (!permissionStatus || !permissionStatus.granted) {
      const { granted } = await requestPermission();
      return granted;
    }
    return true;
  }, [permissionStatus, requestPermission]);

  const handlePickImage = useCallback(async () => {
    const ok = await requestMediaPermission();
    if (!ok) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      selectionLimit: 1,
    });
    if (!res.canceled && res.assets && res.assets[0]) {
      setNewImageUri(res.assets[0].uri);
    }
  }, [requestMediaPermission]);

  const openAddModal = useCallback(() => {
    setNewName('');
    setNewImageUri(undefined);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = `${Date.now()}`;
    setCards(prev => [{ id, name: trimmed, imageUri: newImageUri }, ...prev]);
    setModalVisible(false);
    setNewName('');
    setNewImageUri(undefined);
  }, [newName, newImageUri]);

  const renderItem = useCallback(({ item }: { item: CardItem }) => {
    return (
      <Pressable onPress={() => { if (item.imageUri) setViewerUri(item.imageUri); }} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} contentFit="cover" />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <MaterialIcons name="image" size={32} color="#9E9E9E" />
          </View>
        )}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>Membership card</Text>
        </View>
      </Pressable>
    );
  }, []);

  const empty = useMemo(() => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="style" size={48} color="#9E9E9E" />
      <Text style={styles.emptyTitle}>No cards yet</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to add your first card</Text>
    </View>
  ), []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={cards.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
        ListEmptyComponent={empty}
      />

      <Pressable onPress={openAddModal} style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]} android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}>
        <MaterialIcons name="add" size={28} color="white" />
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add card</Text>

            <TextInput
              placeholder="Card name"
              value={newName}
              onChangeText={setNewName}
              style={styles.input}
              placeholderTextColor="#9E9E9E"
            />

            <Pressable onPress={handlePickImage} style={({ pressed }) => [styles.pickButton, pressed && styles.pickButtonPressed]} android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
              <MaterialIcons name="photo-library" size={20} color={newImageUri ? '#1E88E5' : '#424242'} />
              <Text style={[styles.pickButtonText, newImageUri ? { color: '#1E88E5' } : null]}>
                {newImageUri ? 'Change image' : 'Pick image'}
              </Text>
            </Pressable>

            {newImageUri ? (
              <Image source={{ uri: newImageUri }} style={styles.previewImage} contentFit="cover" />
            ) : null}

            <View style={styles.modalActions}>
              <Pressable onPress={() => setModalVisible(false)} style={({ pressed }) => [styles.actionBtn, pressed && styles.actionBtnPressed]} android_ripple={{ color: 'rgba(0,0,0,0.06)' }}>
                <Text style={[styles.actionText, { color: '#424242' }]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSave} disabled={!newName.trim()} style={({ pressed }) => [styles.actionBtnPrimary, pressed && styles.actionBtnPrimaryPressed, !newName.trim() && { opacity: 0.5 }]} android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
                <Text style={[styles.actionText, { color: 'white' }]}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!viewerUri} transparent={false} animationType="fade" onRequestClose={() => setViewerUri(null)}>
        <View style={styles.viewerContainer}>
          {viewerUri ? (
            <RNImage source={{ uri: viewerUri }} style={styles.viewerImage} resizeMode="contain" />
          ) : null}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setViewerUri(null)} />
          <Pressable onPress={() => setViewerUri(null)} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.9 }]} android_ripple={{ color: 'rgba(255,255,255,0.3)', borderless: true }}>
            <MaterialIcons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const MD_COLORS = {
  primary: '#1E88E5',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  outline: '#E0E0E0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  fab: '#1E88E5',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MD_COLORS.surfaceVariant,
  },
  card: {
    backgroundColor: MD_COLORS.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
  },
  cardPressed: {
    opacity: 0.96,
  },
  cardImage: {
    width: 96,
    height: 72,
    backgroundColor: '#EEE',
  },
  cardImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: MD_COLORS.textPrimary,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 12,
    color: MD_COLORS.textSecondary,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MD_COLORS.fab,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: {
    opacity: 0.9,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: MD_COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: MD_COLORS.textPrimary,
    marginBottom: 12,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: MD_COLORS.outline,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8, default: 10 }),
    fontSize: 16,
    color: MD_COLORS.textPrimary,
    backgroundColor: '#FAFAFA',
  },
  pickButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: MD_COLORS.outline,
  },
  pickButtonPressed: {
    opacity: 0.96,
  },
  pickButtonText: {
    fontSize: 15,
    color: '#424242',
  },
  previewImage: {
    marginTop: 12,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#EEEEEE',
  },
  actionBtnPressed: {
    opacity: 0.96,
  },
  actionBtnPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: MD_COLORS.primary,
  },
  actionBtnPrimaryPressed: {
    opacity: 0.96,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    color: MD_COLORS.textPrimary,
    fontWeight: '600',
  },
  emptySubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: MD_COLORS.textSecondary,
    textAlign: 'center',
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.select({ ios: 50, android: 24, default: 24 }),
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
});
