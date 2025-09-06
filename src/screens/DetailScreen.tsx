import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Animated,
    Button,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Item } from '../types';
import { fetchItemText } from '../api';

const PINK = '#D81B60';
const BASE_URL = 'https://test-task-server.mediolanum.f17y.com';

const getTextColor = (hex: string) => {
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const DetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item } = route.params as { item: Item };
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;
    const loopRef = useRef<Animated.CompositeAnimation | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(false);
        try {
            const data = await fetchItemText(item.id);
            setText(data.text);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: false
            }).start();
        } catch (err) {
            setError(true);
            setText('Failed to load text.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [item.id]);

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

    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>{item.name}</Text>
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
                    <Text style={styles.errorText}>Failed to load text</Text>
                    <Button title="Retry" onPress={fetchData} color={PINK} />
                </View>
            ) : (
                <Animated.View
                    style={[
                        styles.card,
                        {
                            backgroundColor: `#${item.color}`,
                            opacity: fadeAnim,
                            transform: [{ translateY: fadeAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-20, 0]
                                }) }],
                        },
                    ]}
                >
                    {item.image ? (
                        <Image
                            source={{ uri: `${BASE_URL}${item.image}` }}
                            style={styles.image}
                        />
                    ) : null}
                    <Text style={[styles.text, { color: getTextColor(item.color) }]}>
                        {text}
                    </Text>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center' },
    topBar: {
        backgroundColor: PINK,
        height: 60,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    backButton: { marginRight: 16 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
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
    card: {
        width: '80%',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    image: { width: 150, height: 150, resizeMode: 'contain', marginBottom: 16 },
    text: { fontSize: 16, textAlign: 'center' },
});

export default DetailScreen;
