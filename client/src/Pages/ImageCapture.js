import * as React from 'react';
import { Text, View, Button } from 'react-native';

export default function ImageCapture({ navigation }) {
    return (
        <View>
            <Text>Image Capture Verify</Text>
            <Button
                title="Image Capture Verify"
                onPress={() =>
                    navigation.navigate('ImageCaptureVerify')
                }
            />
        </View>)
}
