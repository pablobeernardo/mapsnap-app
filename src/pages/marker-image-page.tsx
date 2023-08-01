import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { SafeAreaView } from "react-navigation";

export default function MarkerPage({ navigation, route }) {

    const image = [
        {
            url: route.params.marker.imagePath
        }
    ];

    const handleGoBack = () => {
        navigation.goBack();
    }
    

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, backgroundColor: 'black' }}>
                <TouchableOpacity style={[styles.buttonGoBack]} onPress={handleGoBack}>
                    <Text>Voltar</Text>
                
                <ImageViewer imageUrls={image} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )

}

const styles = StyleSheet.create({

    buttonGoBack: {
        backgroundColor: '#303F9F',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 15,
        marginLeft:10,
        width:80,
    },

})