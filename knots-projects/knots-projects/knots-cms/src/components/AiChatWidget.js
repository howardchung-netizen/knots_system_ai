import React, { useState, useEffect, useRef } from 'react';
import { Box, Fab, Paper, Typography, IconButton, TextField, CircularProgress } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import { gql, useMutation } from '@apollo/client';

const SEND_AI_MESSAGE = gql`
  mutation sendAiMessage($data: AiChatMessageInput!) {
    sendAiMessage(data: $data) {
      response
    }
  }
`;

const AiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '您好！我是Tracy。我可以幫您查詢法規、尋找系統資料或進行導覽，請問今天有什麼我可以幫忙的嗎？' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [sendAiMessage] = useMutation(SEND_AI_MESSAGE);

  const toggleChat = () => setIsOpen(!isOpen);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { sender: 'user', text: inputText };
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const { data } = await sendAiMessage({
        variables: {
          data: {
            message: inputText
          }
        }
      });
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.sendAiMessage.response }
      ]);
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: `[系統提示] 伺服器連線異常或 API 呼叫失敗。錯誤訊息: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: isOpen ? 'none' : 'flex'
        }}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Window Box */}
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 360,
          height: 600,
          maxHeight: '80vh',
          zIndex: 1000,
          display: isOpen ? 'flex' : 'none',
          flexDirection: 'column',
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 2,
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SmartToyIcon />
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
              Knots AI Assistant
            </Typography>
          </Box>
          <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Message List */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#f9f9fb' }}>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
              {msg.sender === 'ai' && <SmartToyIcon sx={{ fontSize: 28, color: 'primary.main', mt: 0.5 }} />}
              <Box sx={{
                maxWidth: '75%',
                p: 1.5,
                borderRadius: 2,
                backgroundColor: msg.sender === 'user' ? 'primary.main' : 'white',
                color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                boxShadow: msg.sender === 'ai' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderBottomRightRadius: msg.sender === 'user' ? 4 : undefined,
                borderBottomLeftRadius: msg.sender === 'ai' ? 4 : undefined,
                wordBreak: 'break-word',
                fontSize: '0.9rem',
                lineHeight: 1.5
              }}>
                {msg.text}
              </Box>
              {msg.sender === 'user' && <PersonIcon sx={{ fontSize: 28, color: 'primary.main', mt: 0.5 }} />}
            </Box>
          ))}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
              <SmartToyIcon sx={{ fontSize: 28, color: 'primary.main', mt: 0.5 }} />
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CircularProgress size={16} />
              </Box>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box sx={{ p: 2, backgroundColor: 'white', borderTop: '1px solid #eee', display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="請輸入您的問題..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSend(); }}
            autoComplete="off"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 5,
                backgroundColor: '#f1f1f1',
                '& fieldset': { border: 'none' }
              }
            }}
          />
          <IconButton color="primary" onClick={handleSend} disabled={loading || !inputText.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </>
  );
};

export default AiChatWidget;
