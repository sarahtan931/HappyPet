import * as React from 'react';
import { Text, View, Button } from 'react-native';

export default function ImageCaptureVerify({ navigation }) {
    return (
        <View>
            <Text>Back to Image Capture</Text>
            <Button
                title="Image Capture"
                onPress={() =>
                    navigation.navigate('ImageCapture')
                }
            />
        </View>)

}