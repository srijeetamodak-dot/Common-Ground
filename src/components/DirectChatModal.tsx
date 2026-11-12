import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  Paperclip,
  Smile,
  GraduationCap,
  Play,
  Pause,
  Download,
  FileText,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Avatar } from './Avatar';
import { COLLEGE_NAME } from '../data/mockData';

const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '📚', '☕', '🎉', '🎓', '🔥', '✨', '🙌', '👀'];

export const DirectChatModal: React.FC = () => {
  const {
    activeDirectChatUser,
    closeDirectChat,
    activeConversationMessages,
    sendDirectMessage,
    currentUser,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationMessages.length]);

  if (!activeDirectChatUser) return null;

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendDirectMessage(
      activeDirectChatUser.id,
      activeDirectChatUser.username,
      inputText.trim(),
      'text'
    );
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
  };

  // Voice Note Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          sendDirectMessage(
            activeDirectChatUser.id,
            activeDirectChatUser.username,
            'Voice Note',
            'voice',
            {
              url: base64Audio,
              name: `voice_${Date.now()}.webm`,
              audioDuration: recordingSeconds || 3,
            }
          );
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unsupported:', err);
      // Fallback simulated voice message
      sendDirectMessage(
        activeDirectChatUser.id,
        activeDirectChatUser.username,
        'Voice Note (Simulated)',
        'voice',
        {
          url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
          name: 'voice_note.ogg',
          audioDuration: 5,
        }
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  // File Upload (Photo or Document)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be under 5MB.');
      return;
    }

    const isImg = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      sendDirectMessage(
        activeDirectChatUser.id,
        activeDirectChatUser.username,
        file.name,
        isImg ? 'image' : 'document',
        {
          url: base64Data,
          name: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        }
      );
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  const handlePlayVoice = (id: string, url: string) => {
    if (playingAudioId === id) {
      setPlayingAudioId(null);
      return;
    }
    setPlayingAudioId(id);
    const audio = new Audio(url);
    audio.onended = () => setPlayingAudioId(null);
    audio.play().catch(() => setPlayingAudioId(null));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white border border-stone-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh]">
        {/* Chat Header - Warm Crimson Accent */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar user={activeDirectChatUser} size="md" showRollStatus />
            <div>
              <div className="flex items-center gap-1.5 font-bold text-sm text-stone-900">
                <span>@{activeDirectChatUser.username}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold">
                  Verified Student
                </span>
              </div>
              <div className="text-[11px] text-stone-500 truncate max-w-xs">
                {activeDirectChatUser.course ? activeDirectChatUser.course.split('(')[0] : 'JMC'} • {activeDirectChatUser.year || ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-red-800 bg-red-50 border border-red-200 px-2 py-1 rounded-xl">
              <Lock className="w-3 h-3 text-red-700" />
              <span>Private & Safe</span>
            </div>
            <button
              onClick={closeDirectChat}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reassurance Notice Banner */}
        <div className="px-4 py-1.5 bg-rose-50/60 border-b border-rose-100 text-[11px] text-stone-600 flex items-center justify-between">
          <span>🔒 1-on-1 private student conversation. Zero calls, strictly private between you two.</span>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/30">
          {activeConversationMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-stone-400">
              <Avatar user={activeDirectChatUser} size="lg" />
              <div className="font-bold text-sm text-stone-700">
                Start chatting with @{activeDirectChatUser.username}
              </div>
              <p className="text-xs max-w-xs text-stone-500">
                Break the ice about college clubs, course notes, or upcoming campus events!
              </p>
            </div>
          ) : (
            activeConversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <Avatar
                      user={{
                        id: msg.senderId,
                        username: msg.senderUsername,
                        avatarUrl: msg.senderAvatar,
                        useStandardAvatar: msg.senderUseStandardAvatar,
                      }}
                      size="xs"
                    />
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl p-3 text-xs shadow-xs space-y-1.5 ${
                      isMe
                        ? 'bg-red-700 text-white rounded-br-none'
                        : 'bg-white text-stone-900 border border-stone-200 rounded-bl-none'
                    }`}
                  >
                    {/* Message Body by Type */}
                    {msg.type === 'text' && (
                      <p className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                        {msg.text}
                      </p>
                    )}

                    {msg.type === 'image' && msg.attachmentUrl && (
                      <div className="space-y-1">
                        <img
                          src={msg.attachmentUrl}
                          alt={msg.attachmentName || 'Attachment'}
                          className="max-h-56 rounded-xl object-cover w-full border border-black/10"
                        />
                        {msg.text && msg.text !== msg.attachmentName && (
                          <p className="text-xs pt-1">{msg.text}</p>
                        )}
                      </div>
                    )}

                    {msg.type === 'document' && msg.attachmentUrl && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/10">
                        <FileText className="w-5 h-5 shrink-0" />
                        <div className="truncate flex-1">
                          <div className="font-semibold truncate">{msg.attachmentName}</div>
                          {msg.attachmentSize && (
                            <div className="text-[10px] opacity-75">{msg.attachmentSize}</div>
                          )}
                        </div>
                        <a
                          href={msg.attachmentUrl}
                          download={msg.attachmentName || 'file'}
                          className="p-1 rounded hover:bg-black/10 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {msg.type === 'voice' && msg.attachmentUrl && (
                      <div className="flex items-center gap-2.5 min-w-[180px] py-1">
                        <button
                          type="button"
                          onClick={() => handlePlayVoice(msg.id, msg.attachmentUrl!)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${
                            isMe ? 'bg-white text-red-700' : 'bg-red-700 text-white'
                          }`}
                        >
                          {playingAudioId === msg.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-black/15 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                playingAudioId === msg.id ? 'bg-white animate-pulse w-full' : 'w-1/3 bg-current'
                              }`}
                            />
                          </div>
                          <span className="text-[10px] opacity-75 mt-0.5 block">
                            🎙️ Voice Note {msg.audioDuration ? `(${msg.audioDuration}s)` : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    <div
                      className={`text-[9px] text-right mt-1 ${
                        isMe ? 'text-rose-100' : 'text-stone-400'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji Quick Picker Toolbar */}
        {showEmojiPicker && (
          <div className="p-2 border-t border-stone-200 bg-stone-50 flex items-center gap-2 overflow-x-auto">
            {EMOJI_LIST.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => handleSelectEmoji(em)}
                className="text-lg p-1.5 hover:bg-stone-200 rounded-lg transition-transform hover:scale-125 cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>
        )}

        {/* Recording active state banner */}
        {isRecording && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex items-center justify-between text-xs text-red-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <span className="font-bold">Recording Voice Note... {recordingSeconds}s</span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1 rounded-lg bg-red-700 text-white font-bold text-xs hover:bg-red-800 cursor-pointer"
            >
              Send Voice
            </button>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="p-3 border-t border-stone-200 bg-white">
          <form onSubmit={handleSendText} className="flex items-center gap-2">
            {/* Attachment inputs */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Attach photo or document"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              className="p-2 rounded-xl text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
              title="Emoticons"
            >
              <Smile className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message @${activeDirectChatUser.username}...`}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-900 placeholder:text-stone-400 text-sm focus:outline-none focus:border-red-600 focus:bg-white transition-all"
            />

            {/* Mic / Voice Recording Button */}
            {!inputText.trim() && (
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-red-700 text-white animate-pulse'
                    : 'text-stone-500 hover:text-red-700 hover:bg-red-50'
                }`}
                title={isRecording ? 'Stop & Send Recording' : 'Hold to record voice message'}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            {/* Send Text Button */}
            {inputText.trim() && (
              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-red-700 hover:bg-red-800 text-white transition-all shadow-md shadow-red-700/20 active:scale-95 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
