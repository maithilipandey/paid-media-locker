import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useMediaStore } from '../store/mediaStore';
import { useAuthStore } from '../store/authStore';

const HomeScreen = ({ navigation }) => {
  const { fetchDiscoverFeed, media, isLoading } = useMediaStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState('recent');

  useEffect(() => {
    loadFeed();
  }, [sort]);

  const loadFeed = async () => {
    await fetchDiscoverFeed(1, sort);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeed();
    setRefreshing(false);
  };

  const renderMediaCard = ({ item }) => (
    <TouchableOpacity
      style={styles.mediaCard}
      onPress={() => navigation.navigate('MediaDetail', { mediaId: item._id })}
    >
      {item.thumbnailUrl || item.previewKey ? (
        <Image
          source={{ uri: item.thumbnailUrl || 'https://via.placeholder.com/300x200?text=' + item.title }}
          style={styles.thumbnail}
        />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
          <Text style={styles.placeholderText}>{item.title.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.mediaTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.mediaPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.creatorName}>{item.creator?.displayName || 'Unknown'}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>{item.views} views</Text>
          <Text style={styles.stat}>{item.purchases} sold</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.displayName || user?.username}</Text>
        <Text style={styles.subgreeting}>Discover premium content</Text>
      </View>
    </View>
  );

  const renderSortButtons = () => (
    <View style={styles.sortContainer}>
      {['recent', 'trending', 'popular', 'price_low', 'price_high'].map((s) => (
        <TouchableOpacity
          key={s}
          style={[styles.sortButton, sort === s && styles.sortButtonActive]}
          onPress={() => setSort(s)}
        >
          <Text style={[styles.sortButtonText, sort === s && styles.sortButtonTextActive]}>
            {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (isLoading && media.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={media}
        renderItem={renderMediaCard}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderSortButtons()}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 8,
    paddingVertical: 16,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subgreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sortButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 8,
  },
  mediaCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#e0e0e0',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ccc',
  },
  cardContent: {
    padding: 10,
  },
  mediaTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
  mediaPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  creatorName: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    fontSize: 10,
    color: '#999',
  },
});

export default HomeScreen;
