'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Phone, Video, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  timestamp: number;
  buttons?: Array<{ id: string; title: string }>;
}

export default function WhatsAppSimulatorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'bot',
      text: 'Olá! 👋 Sou o assistente virtual da Consultor.AI. Como posso te ajudar hoje?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneNumber] = useState('5511999999999'); // Número simulado
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    // Adiciona mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Envia para o webhook mock
      const response = await fetch('/api/webhook/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: phoneNumber,
          text: messageText,
          timestamp: Date.now(),
        }),
      });

      const data = await response.json();

      // Adiciona resposta do bot
      if (data.response) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          from: 'bot',
          text: data.response.text || data.response,
          timestamp: Date.now(),
          buttons: data.response.buttons,
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        from: 'bot',
        text: '❌ Erro ao processar mensagem. Tente novamente.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleButtonClick = (buttonText: string) => {
    sendMessage(buttonText);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a1014]">
      {/* Header - estilo WhatsApp */}
      <div className="bg-[#1f2c33] px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
            AI
          </div>
          <div>
            <h2 className="text-white font-medium">Consultor.AI Assistant</h2>
            <p className="text-xs text-gray-400">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-gray-400">
          <Video className="w-5 h-5 cursor-pointer hover:text-white" />
          <Phone className="w-5 h-5 cursor-pointer hover:text-white" />
          <MoreVertical className="w-5 h-5 cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-900/30 px-4 py-2 border-b border-blue-800">
        <p className="text-sm text-blue-200 text-center">
          🧪 <strong>Simulador de WhatsApp</strong> - Teste o flow conversacional sem API real
        </p>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-3 py-2 ${
                msg.from === 'user'
                  ? 'bg-[#005c4b] text-white'
                  : 'bg-[#1f2c33] text-gray-100'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>

              {/* Botões interativos */}
              {msg.buttons && msg.buttons.length > 0 && (
                <div className="mt-2 space-y-1">
                  {msg.buttons.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => handleButtonClick(button.title)}
                      className="w-full text-left px-3 py-2 bg-[#0a1014] hover:bg-[#0d1418] rounded border border-gray-600 text-sm transition-colors"
                      disabled={loading}
                    >
                      {button.title}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`text-[10px] mt-1 ${
                  msg.from === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1f2c33] rounded-lg px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-[#1f2c33] px-4 py-3 border-t border-gray-700">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem..."
              disabled={loading}
              className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            />
          </div>
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-[#00a884] hover:bg-[#00a884]/90 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
