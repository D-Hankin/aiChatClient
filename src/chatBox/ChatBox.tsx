import { useState, useEffect } from 'react';

interface Message {
    name: string;
    prompt: string;
}

function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([{ name: 'George Carlin', prompt: 'Good evening Bill, how was your day?' }]);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchNext, setFetchNext] = useState<boolean>(false);
    
    const fetchMessages = async () => {
        if (messages.length === 0) return; 
        
        setLoading(true); 
        const lastMessage = messages[messages.length - 1];
        
        try {
            const response = await fetch('http://localhost:8080/combined', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: lastMessage.name, prompt: lastMessage.prompt })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.formData();  

            const messageJson = data.get('chatBot');
            if (messageJson && typeof messageJson === 'string') {
                const messageObj = JSON.parse(messageJson);  

                const audioBlob = data.get('audioFile');
                if (audioBlob instanceof Blob) {
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.play(); 
                    setMessages(prevMessages => [...prevMessages, messageObj]);
                    audio.onended = () => {
                        setFetchNext(true);
                    };
                } else {
                    console.error('No audio file found');}
        }
    } catch (error) {
        console.error('Error fetching combined message and audio:', error);
    } finally {
        setLoading(false); 
    }
    };

    //Not in use now fetches have been combined.
    // const fetchAudio = async (message: Message) => {

    //     console.log('fetching audio...', message);
    //     try {
    //         const response = await fetch('http://localhost:8080/audio', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ "name": message.name,
    //                 "prompt": message.prompt
    //             })
    //         });

    //         if (!response.ok) {
    //             throw new Error('Network response was not ok');
    //         }

    //         const data = await response.blob();
    //         const audioUrl = URL.createObjectURL(data);
    //         const audio = new Audio(audioUrl);
    //         audio.play();
    //     } catch (error) {
    //         console.error('Error fetching audio:', error);
    //     }
    // };

    useEffect(() => {
        setFetchNext(true);
    }, []);

    useEffect(() => {
        if (fetchNext) {
            fetchMessages();
            setFetchNext(false); 
        }
    }, [fetchNext]); 
    
    return (
        <div style={{ width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {messages.map((message, index) => (
                <div 
                    style={{ 
                        backgroundColor: message.name === "George Carlin" ? 'blue' : 'green', 
                        alignSelf: message.name === "George Carlin" ? 'flex-start' : 'flex-end', 
                        textAlign: message.name === "George Carlin" ? 'left' : 'right',
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
