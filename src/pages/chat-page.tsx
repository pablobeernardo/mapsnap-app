import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import ChatEntity from '../entities/chat-entity';
import { onValue, push, ref } from 'firebase/database';
import { getStorageData } from '../shared/secury-storage';
import { db } from '../../firebase-config';

const ChatPage = ({ navigation, route }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const flatListRef = useRef(null);
  const [author, setAuthor] = useState('');

  useEffect(() => {
    getAuthor();
    getMessages();
  }, []);

  async function getAuthor() {
    const storedAuthor = await getStorageData('author');
    setAuthor(storedAuthor);
  }

  async function getMessages() {
    onValue(ref(db, `/messages/${route.params.marker.id}`), (snapshot) => {
      try {
        const updatedMessages = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const childkey = childSnapshot.key;
            const childValue = childSnapshot.val();
            childValue.id = childkey;
            updatedMessages.push(childValue);
          });
          setMessages(updatedMessages);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  async function sendMessage() {
    if (inputMessage.trim() === '') {
      return;
    }

    const newMessage: ChatEntity = {
      id: Math.random().toString(),
      data: Date.now(),
      message: inputMessage,
      sender: author,
    };

    await push(ref(db, `messages/${route.params.marker.id}`), newMessage);
    setInputMessage('');
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.messageContainer,
              item.sender === author ? styles.sentMessageContainer : styles.receivedMessageContainer,
            ]}>
              {item.sender !== author && (
                <View style={styles.avatarContainer}>
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: 'https://st3.depositphotos.com/19428878/36416/v/450/depositphotos_364169666-stock-illustration-default-avatar-profile-icon-vector.jpg',
                    }}
                  />
                  <Text style={styles.authorName}>{item.sender}</Text>
                </View>
              )}
              <View style={[
                styles.messageContent,
                item.sender === author ? styles.sentMessageContent : styles.receivedMessageContent,
              ]}>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timestamp}>{new Date(item.data).toLocaleTimeString()}</Text>
              </View>
              {item.sender === author && (
                <View style={styles.avatarContainer}>
                  <Image
                    style={styles.profileImage}
                    source={{
                      uri: 'https://st3.depositphotos.com/19428878/36416/v/450/depositphotos_364169666-stock-illustration-default-avatar-profile-icon-vector.jpg',
                    }}
                  />
                  <Text style={styles.authorName}>{item.sender}</Text>
                </View>
              )}
            </View>
          )}
          contentContainerStyle={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={inputMessage}
            onChangeText={setInputMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};




const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  messageList: {
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 5,
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
  },
  avatarContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
  },
  authorName: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 5
  },
  messageContent: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  messageText: {
    fontSize: 14,
    color: 'black',
  },
  sentMessageContent: {
    backgroundColor: '#303F9F',
    borderColor: '#303F9F',
    alignSelf: 'flex-end',
    marginLeft: 50, 
  },
  receivedMessageContent: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
    marginRight: 50, 
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#303F9F',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ChatPage;