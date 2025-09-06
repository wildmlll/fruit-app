import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Image,
    Animated,
    Alert,
    Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Item } from '../types';
import { fetchRandomItems } from '../api';

const PINK = '#D81B60';
const BASE_URL = 'https://test-task-server.mediolanum.f17y.com';

const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const ListScreen = () => {
    const navigation = useNavigation();
    const [title, setTitle] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await fetchRandomItems();
            setTitle(data.title);
            setItems(data.items);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false
            }).start();
        } catch (err) {
            setError(true);
            Alert.alert('Error', 'Failed to load data. Please try again or check your connection.', [
                { text: 'Retry', onPress: () => fetchData() },
                { text: 'Cancel', style: 'cancel' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []); // Only run on mount

    useEffect(() => {
        if (loading) {
            loopRef.current = Animated.loop(
                Animated.timing(spinAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: false
                })
            );
            loopRef.current.start();
        } else {
            if (loopRef.current) {
                loopRef.current.stop();
            }
            spinAnim.setValue(0);
        }
    }, [loading]);

    const spin = spinAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            style={[styles.itemCard, { backgroundColor: `#${item.color}` }]}
            onPress={() => navigation.navigate('Detail', { item })}
        >
            <Text
                style={[
                    styles.itemName,
                    { color: getTextColor(item.color) },
                ]}
            >
                {item.name}
            </Text>
            {item.image ? (
                <Image
                    source={{ uri: `${BASE_URL}${item.image}` }}
                    style={styles.itemImage}
                />
            ) : null}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                {!loading && !error && <Text style={styles.title}>{title}</Text>}
                <TouchableOpacity onPress={fetchData} style={styles.refreshButton}>
                    <Image
                        source={require('../assets/refresh_button.svg')}
                        style={styles.refreshIcon}
                    />
                </TouchableOpacity>
            </View>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <Animated.Image
                        source={require('../assets/loader.png')}
                        style={[styles.loader, { transform: [{ rotate: spin }] }]}
                    />
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Failed to load data</Text>
                    <Button title="Retry" onPress={fetchData} color={PINK} />
                </View>
            ) : (
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-20, 0]
                            }) }],
                        flex: 1,
                    }}
                >
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    topBar: {
        backgroundColor: PINK,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    refreshButton: { position: 'absolute', right: 16 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20,
    },
    loader: { width: 40, height: 40, resizeMode: 'contain' },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: { textAlign: 'center', marginBottom: 10, color: 'red' },
    listContent: { padding: 16 },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },
    itemName: { fontSize: 18, fontWeight: 'bold' },
    itemImage: { width: 60, height: 60, resizeMode: 'contain' },
    refreshIcon: { width: 24, height: 24, tintColor: 'white' },
});

export default ListScreen;
