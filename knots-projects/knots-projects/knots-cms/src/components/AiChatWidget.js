import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, TextField, CircularProgress } from '@mui/material';
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
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '您好！我是Tracy。我可以幫您查詢法規、尋找系統資料或進行導覽，請問今天有什麼我可以幫忙的嗎？' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const [sendAiMessage] = useMutation(SEND_AI_MESSAGE);

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
    <Box sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'background.paper',
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToyIcon color="primary" />
          <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 600, color: 'text.primary' }}>
            Knots AI Assistant
          </Typography>
        </Box>
      </Box>

      {/* Message List */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {messages.map((msg, idx) => (
          <Box key={idx} sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', gap: 1 }}>
            {msg.sender === 'ai' && <SmartToyIcon sx={{ fontSize: 24, color: 'text.secondary', mt: 0.5 }} />}
            <Box sx={{
              maxWidth: '85%',
              p: 1.5,
              borderRadius: 1,
              backgroundColor: msg.sender === 'user' ? 'primary.main' : 'background.default',
              color: msg.sender === 'user' ? '#fff' : 'text.primary',
              border: msg.sender === 'ai' ? '1px solid' : 'none',
              borderColor: 'divider',
              wordBreak: 'break-word',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}>
              {msg.text}
            </Box>
            {msg.sender === 'user' && <PersonIcon sx={{ fontSize: 24, color: 'primary.main', mt: 0.5 }} />}
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1 }}>
            <SmartToyIcon sx={{ fontSize: 24, color: 'text.secondary', mt: 0.5 }} />
            <Box sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
              <CircularProgress size={14} color="inherit" />
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box sx={{ p: 2, backgroundColor: 'background.default', borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="詢問 Tracy..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { 
            if (e.key === 'Enter' && !e.shiftKey) { 
              e.preventDefault();
              handleSend(); 
            } 
          }}
          multiline
          maxRows={5}
          autoComplete="off"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'primary.main' }
            }
          }}
        />
        <IconButton color="primary" onClick={handleSend} disabled={loading || !inputText.trim()}>
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default AiChatWidget;
