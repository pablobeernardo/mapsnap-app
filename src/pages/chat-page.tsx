import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet } from 'react-native';
import ChatEntity from '../entities/chat-entity';
import { onValue, push, ref } from 'firebase/database';
import { db } from '../../firebase-config';
import { getStorageData } from '../shared/secury-storage';

const ChatPage = ({ navigation, route }) => {
  const [messages, setMessages] = useState<ChatEntity[]>([]);
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
            setMessages([]);
            if (snapshot !== undefined) {
              snapshot.forEach((childSnapshot) => {
    
                const childkey = childSnapshot.key;
                let childValue = childSnapshot.val();
                childValue.id = childkey;
                setMessages((messages) => [...messages, (childValue as ChatEntity)])
              });
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
    <View style={styles.container}>
      <View style={styles.chatContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === author ? styles.userBubble : styles.otherBubble]}>
              <Image
                style={styles.authorImage}
                source={{ uri: item.sender === author ? 'URL_DA_IMAGEM_DO_AUTOR' : 'URL_DA_IMAGEM_OUTRO_AUTOR' }}
              />
              <View style={styles.messageContent}>
                <Text style={styles.authorName}>{item.sender}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.timestamp}>{new Date(item.data).toLocaleTimeString()}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messageList}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite sua mensagem..."
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '70%',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007BFF',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#EDEDED',
  },
  authorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  authorName: {
    fontSize: 12,
    color: 'gray',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: 'gray',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#EDEDED',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#EDEDED',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  buttonText: {
    color: 'white',
  },
});

export default ChatPage;