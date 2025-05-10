import React, { useState, useRef, useEffect } from "react";
import {
  Box, Typography, TextField, IconButton, Avatar,
  CircularProgress, Paper, Menu, MenuItem, Dialog,
  DialogContent, DialogTitle, Button, Alert
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import {
  Send, MoreVert, Delete, Add, History, Download, Warning
} from "@mui/icons-material";
import axios from "axios";

const API_CONFIG = {
  BASE_URL: "https://api.openai.com/v1",
  MODEL: "gpt-3.5-turbo",
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7
};

const medicalBackground = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <!-- Анимированный стетоскоп -->
    <path d="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" stroke="#0A3D2F" stroke-width="2" fill="none">
      <animate attributeName="d" 
        values="M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60;
                M50,20 Q65,22 65,32 T75,42 L75,52 Q75,62 70,62;
                M50,20 Q60,20 60,30 T70,40 L70,50 Q70,60 65,60" 
        dur="5s" repeatCount="indefinite"/>
    </path>
  
    <!-- Пульсирующий крест -->
    <g transform="translate(25,25)">
      <rect x="-3" y="-10" width="6" height="20" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
      <rect x="-10" y="-3" width="20" height="6" fill="green">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </rect>
    </g>
  
    <!-- Вращающаяся молекула -->
    <g transform="translate(75,25)">
      <circle cx="0" cy="0" r="3" fill="#E3A700">
        <animate attributeName="r" values="3;4;3" dur="3s" repeatCount="indefinite"/>
      </circle>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="10s" repeatCount="indefinite"/>
        <circle cx="0" cy="-8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="0" cy="8" r="2" fill="#E3A700" opacity="0.8"/>
        <circle cx="-8" cy="0" r="2" fill="#E3A700" opacity="0.8"/>
      </g>
    </g>
  
    <!-- Движущиеся капсулы -->
    <g transform="translate(20,70)">
      <ellipse cx="0" cy="0" rx="10" ry="5" fill="#0A3D2F" opacity="0.7">
        <animate attributeName="rx" values="10;12;10" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="5;6;5" dur="4s" repeatCount="indefinite"/>
      </ellipse>
      <animateTransform attributeName="transform" 
        type="translate" 
        from="20,70" 
        to="80,70" 
        dur="15s" 
        repeatCount="indefinite"
        additive="sum"/>
    </g>
  
    <!-- Пульсирующая сердечная линия -->
    <polyline points="10,85 15,85 20,65 25,95 30,85 35,85" 
      stroke="#FF8C00" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="points" 
        values="10,85 15,85 20,65 25,95 30,85 35,85;
                10,85 15,85 20,75 25,85 30,85 35,85;
                10,85 15,85 20,65 25,95 30,85 35,85" 
        dur="1.5s" 
        repeatCount="indefinite"/>
    </polyline>
  
    <!-- Движущиеся ДНК спирали -->
    <path d="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
      stroke="#E3A700" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80;
                M85,40 C80,45 80,55 85,60 C90,65 90,75 85,80;
                M85,40 C90,45 90,55 85,60 C80,65 80,75 85,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
    <path d="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
      stroke="#0A3D2F" 
      fill="none" 
      stroke-width="1.5">
      <animate attributeName="d" 
        values="M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80;
                M80,40 C85,45 85,55 80,60 C75,65 75,75 80,80;
                M80,40 C75,45 75,55 80,60 C85,65 85,75 80,80" 
        dur="6s" 
        repeatCount="indefinite"/>
    </path>
  </svg>
`;

const createAppTheme = () => createTheme({
  palette: {
    primary: { main: "#001A00" },
    secondary: { main: "#6D6D6D" },
    background: { default: "#F7F9FC", paper: "#FFFFFF" },
    text: { primary: "#2D3748", secondary: "#718096" }
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: { fontWeight: 700 },
    body1: { fontWeight: 400 },
    button: { fontWeight: 600 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", fontWeight: 600, padding: "8px 18px", borderRadius: 30, transition: "all 0.2s ease" } } },
    MuiTextField: { styleOverrides: { root: { "& .MuiOutlinedInput-root": { borderRadius: 30, backgroundColor: "#F5F7FA", "&:hover": { backgroundColor: "#EFF1F5" }, "&.Mui-focused": { backgroundColor: "#EFF1F5" } } } } },
    MuiPaper: { styleOverrides: { root: { backgroundColor: "#FFFFFF", boxShadow: "0 8px 32px rgba(6, 6, 6, 0.08)" } } },
    MuiAvatar: { styleOverrides: { root: { fontWeight: 700 } } },
    MuiIconButton: { styleOverrides: { root: { transition: "transform 0.2s ease", "&:hover": { transform: "scale(1.05)" } } } }
  }
});

export default function MedicalAIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(`chat_${Date.now()}`);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [error, setError] = useState(null);
  const [emergencyAlert, setEmergencyAlert] = useState(false);

  const theme = createAppTheme();
  const messagesEndRef = useRef(null);
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

  useEffect(() => {
    const savedChats = localStorage.getItem("medicalChatHistory");
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats);
        setChatHistory(parsedChats);
        if (parsedChats.length > 0) loadChat(parsedChats[0].id);
      } catch (e) {
        console.error("Error loading chat history:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const updatedHistory = updateChatHistory();
      localStorage.setItem("medicalChatHistory", JSON.stringify(updatedHistory));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateChatHistory = () => {
    const updatedHistory = [...chatHistory];
    const existingChatIndex = updatedHistory.findIndex(chat => chat.id === currentChatId);
    if (existingChatIndex >= 0) {
      updatedHistory[existingChatIndex] = { ...updatedHistory[existingChatIndex], messages, lastUpdated: new Date().toISOString() };
    } else {
      updatedHistory.unshift({ id: currentChatId, title: generateChatTitle(), messages, lastUpdated: new Date().toISOString() });
    }
    return updatedHistory.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
  };

  const generateChatTitle = () => {
    const firstMessage = messages[0]?.content || "New Chat";
    return firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "");
  };

  const detectLanguage = (text) => /[а-яА-ЯЁё]/.test(text) ? 'ru' : 'en';

  const checkForEmergencyKeywords = (text, language) => {
    const keywords = language === 'en'
      ? ['emergency', 'urgent', 'stroke', 'heart attack', '911']
      : ['срочно', 'немедленно', 'инсульт', 'инфаркт', 'скорую'];
    if (keywords.some(keyword => text.toLowerCase().includes(keyword))) setEmergencyAlert(true);
  };

  const fetchAIResponse = async (userMessage) => {
    setIsTyping(true);
    setError(null);
    setEmergencyAlert(false);

    try {
      const userLanguage = detectLanguage(userMessage);
      const systemMessage = {
        role: "system",
        content: userLanguage === 'en'
          ? "You are a helpful medical assistant. Provide clear info in format:\n### Analysis:\n[context]\n### Recommendations:\n1. [action]\n2. [action]\n### ❗ Emergency signs:\n• [symptom]"
          : "Вы медицинский ассистент. Отвечайте в формате:\n### Анализ:\n[контекст]\n### Рекомендации:\n1. [действие]\n2. [действие]\n### 🚨 Срочно к врачу:\n• [симптом]"
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/chat/completions`,
        {
          model: API_CONFIG.MODEL,
          messages: [systemMessage, { role: "user", content: userMessage }],
          max_tokens: API_CONFIG.MAX_TOKENS,
          temperature: API_CONFIG.TEMPERATURE
        },
        {
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }
        }
      );

      const aiText = response.data.choices[0].message.content;
      checkForEmergencyKeywords(aiText, userLanguage);

      return { role: "assistant", content: aiText, timestamp: new Date().toISOString(), language: userLanguage };
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input, timestamp: new Date().toISOString(), language: detectLanguage(input) };
    setMessages(prev => [...prev, userMessage]);
    setInput("");

    try {
      const aiResponse = await fetchAIResponse(input);
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      const errorMessage = {
        role: "assistant",
        content: detectLanguage(input) === 'ru' ? "🚨 Ошибка сервера. Попробуйте позже." : "🚨 Service error. Please try again later.",
        timestamp: new Date().toISOString(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(error.message);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentChatId(`chat_${Date.now()}`);
    setEmergencyAlert(false);
  };

  const loadChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setMessages(chat.messages);
      setCurrentChatId(chatId);
      setHistoryOpen(false);
    }
  };

  const deleteChat = (chatId) => {
    const updatedHistory = chatHistory.filter((chat) => chat.id !== chatId);
    setChatHistory(updatedHistory);
    localStorage.setItem("medicalChatHistory", JSON.stringify(updatedHistory));
    if (currentChatId === chatId) startNewChat();
  };

  const exportChat = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const exportName = `medical_chat_${new Date().toISOString().slice(0, 10)}.json`;
    const link = document.createElement("a");
    link.setAttribute("href", dataUri);
    link.setAttribute("download", exportName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importChat = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedMessages = JSON.parse(event.target.result);
        if (Array.isArray(importedMessages)) {
          const newChat = {
            id: `imported_${Date.now()}`,
            title: "Imported Chat",
            messages: importedMessages,
            lastUpdated: new Date().toISOString(),
          };
          setChatHistory((prev) => [newChat, ...prev]);
          setMessages(importedMessages);
          setCurrentChatId(newChat.id);
        }
      } catch {
        alert(detectLanguage(navigator.language) === "ru" ? "Ошибка при импорте чата" : "Error importing chat");
      }
    };
    reader.readAsText(file);
  };

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const renderMessageContent = (content) =>
    content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br />");

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          p: 2,
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
              medicalBackground
            )}")`,
            backgroundSize: "150px 150px",
            opacity: 0.1,
            zIndex: 0,
          }}
        />

        <Box
          sx={{
            width: "100%",
            maxWidth: 800,
            height: "85vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 3,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h5" color="primary">
              CheckAI
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                startIcon={<History />}
                onClick={() => setHistoryOpen(true)}
                variant="outlined"
                size="small"
              >
                {detectLanguage(navigator.language) === "ru" ? "История" : "History"}
              </Button>
              <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                <MoreVert />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={startNewChat}>
                  <Add sx={{ mr: 1 }} />
                  {detectLanguage(navigator.language) === "ru" ? "Новый чат" : "New chat"}
                </MenuItem>
                <MenuItem onClick={exportChat}>
                  <Download sx={{ mr: 1 }} />
                  {detectLanguage(navigator.language) === "ru" ? "Экспорт" : "Export"}
                </MenuItem>
                <MenuItem onClick={() => document.getElementById("import-chat").click()}>
                  <Download sx={{ mr: 1 }} />
                  {detectLanguage(navigator.language) === "ru" ? "Импорт" : "Import"}
                </MenuItem>
                <MenuItem onClick={() => deleteChat(currentChatId)}>
                  <Delete sx={{ mr: 1 }} />
                  {detectLanguage(navigator.language) === "ru" ? "Удалить чат" : "Delete chat"}
                </MenuItem>
              </Menu>
              <input
                id="import-chat"
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={importChat}
              />
            </Box>
          </Box>

          {emergencyAlert && (
            <Alert
              severity="error"
              icon={<Warning />}
              sx={{ mx: 2, mt: 1, alignItems: "center", "& .MuiAlert-message": { overflow: "hidden" } }}
            >
              {detectLanguage(navigator.language) === "ru"
                ? "⚠️ Обнаружены опасные симптомы! Немедленно обратитесь за медицинской помощью!"
                : "⚠️ Critical symptoms detected! Seek immediate medical attention!"}
            </Alert>
          )}

          <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>{detectLanguage(navigator.language) === "ru" ? "История чатов" : "Chat History"}</DialogTitle>
            <DialogContent>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Add />}
                onClick={startNewChat}
                sx={{ mb: 2 }}
              >
                {detectLanguage(navigator.language) === "ru" ? "Новый чат" : "New Chat"}
              </Button>
              {chatHistory.length === 0 ? (
                <Typography sx={{ textAlign: "center", py: 2 }}>
                  {detectLanguage(navigator.language) === "ru"
                    ? "История чатов пуста"
                    : "No chat history available"}
                </Typography>
              ) : (
                chatHistory.map((chat) => (
                  <Paper
                    key={chat.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                    onClick={() => {
                      loadChat(chat.id);
                      setHistoryOpen(false);
                    }}
                  >
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography noWrap>{chat.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(chat.lastUpdated).toLocaleString()}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }}
                      color="error"
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Paper>
                ))
              )}
            </DialogContent>
          </Dialog>

          <Box sx={{ flex: 1, overflowY: "auto", p: 3, bgcolor: "background.default" }}>
            {messages.length === 0 ? (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="h5" gutterBottom>
                  {detectLanguage(navigator.language) === "ru"
                    ? "Медицинский AI Ассистент"
                    : "Medical AI Assistant"}
                </Typography>
                <Typography>
                  {detectLanguage(navigator.language) === "ru"
                    ? "Задайте вопрос о ваших симптомах или состоянии здоровья"
                    : "Ask about your symptoms or health condition"}
                </Typography>
              </Box>
            ) : (
              messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    flexDirection: message.role === "user" ? "row-reverse" : "row",
                    alignItems: "flex-start",
                    mb: 3,
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor:
                        message.role === "user" ? theme.palette.primary.main : theme.palette.secondary.main,
                      ml: message.role === "user" ? 2 : 0,
                      mr: message.role === "user" ? 0 : 2,
                    }}
                  >
                    {message.role === "user"
                      ? detectLanguage(navigator.language) === "ru"
                        ? "Вы"
                        : "You"
                      : "AI"}
                  </Avatar>
                  <Box sx={{ maxWidth: "75%", minWidth: "50%" }}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius:
                          message.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        bgcolor: message.role === "user" ? "primary.main" : "background.paper",
                        color: message.role === "user" ? "primary.contrastText" : "text.primary",
                      }}
                    >
                      <Typography
                        component="div"
                        dangerouslySetInnerHTML={{ __html: renderMessageContent(message.content) }}
                        sx={{ "& strong": { fontWeight: "bold" }, "& em": { fontStyle: "italic" } }}
                      />
                    </Paper>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: message.role === "user" ? "right" : "left",
                        mt: 0.5,
                        color: "text.secondary",
                      }}
                    >
                      {formatTime(message.timestamp)}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
            {isTyping && (
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "secondary.main" }}>AI</Avatar>
                <Paper sx={{ p: 2, ml: 2 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {detectLanguage(navigator.language) === "ru"
                      ? "Анализирую запрос..."
                      : "Processing your request..."}
                  </Typography>
                </Paper>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <TextField
              fullWidth
              placeholder={detectLanguage(navigator.language) === "ru" ? "Введите сообщение..." : "Type a message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 30, bgcolor: "background.default" } }}
            />
            <IconButton type="submit" disabled={!input.trim() || isTyping} color="primary">
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}