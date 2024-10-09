import { useState, useEffect } from 'react';

interface Message {
    name: string;
    prompt: string;
}

function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([{ name: 'Obi-wan', prompt: 'Good evening Leto, how was your day?' }]);
    const [loading, setLoading] = useState<boolean>(false);
    
    const fetchMessages = async () => {
        if (messages.length === 0) return; 
        
        setLoading(true); 
        const lastMessage = messages[messages.length - 1];
        
        try {
            const response = await fetch('http://localhost:8080/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: lastMessage.name, prompt: lastMessage.prompt })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            
            await new Promise(resolve => setTimeout(resolve, 20000)); 
            fetchAudio(data);

            setMessages(prevMessages => [...prevMessages, data]);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false); 
        }
    };

    const fetchAudio = async (message: Message) => {

        console.log('fetching audio...', message);
        try {
            const response = await fetch('http://localhost:8080/audio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ "name": message.name,
                    "prompt": message.prompt
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.blob();
            const audioUrl = URL.createObjectURL(data);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error('Error fetching audio:', error);
        }
    };

    useEffect(() => {
        fetchMessages(); 
    }, [messages]); 
    
    return (
        <div style={{ width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {messages.map((message, index) => (
                <div 
                    style={{ 
                        backgroundColor: message.name === "Obi-wan" ? 'blue' : 'green', 
                        alignSelf: message.name === "Obi-wan" ? 'flex-start' : 'flex-end', 
                        textAlign: message.name === "Obi-wan" ? 'left' : 'right',
                        width: '80%',
                        margin: '5px',
                        padding: '10px',
                        borderRadius: '5px',
                        color: 'white'
                    }} 
                    key={index}
                >
                    <strong>{message.name}</strong>: {message.prompt}
                </div>
            ))}
            {loading && <div>Waiting...</div>}
        </div>
    );
    
}

export default ChatBox;
