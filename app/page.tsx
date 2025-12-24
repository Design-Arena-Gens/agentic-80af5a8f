'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface ActionLog {
  id: number
  action: string
  timestamp: Date
  type: 'tap' | 'swipe' | 'button' | 'gesture' | 'command'
}

interface TouchPoint {
  x: number
  y: number
  id: number
}

export default function MobileControlAgent() {
  const [isConnected, setIsConnected] = useState(false)
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([])
  const [currentScreen, setCurrentScreen] = useState('home')
  const [brightness, setBrightness] = useState(80)
  const [volume, setVolume] = useState(50)
  const [touchPoints, setTouchPoints] = useState<TouchPoint[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [aiMode, setAiMode] = useState(false)
  const [commandInput, setCommandInput] = useState('')
  const screenRef = useRef<HTMLDivElement>(null)
  const touchIdRef = useRef(0)

  const logAction = useCallback((action: string, type: ActionLog['type']) => {
    const newLog: ActionLog = {
      id: Date.now(),
      action,
      timestamp: new Date(),
      type
    }
    setActionLogs(prev => [newLog, ...prev].slice(0, 50))
  }, [])

  const handleConnect = () => {
    setIsConnected(prev => !prev)
    logAction(isConnected ? 'Disconnected from device' : 'Connected to device', 'command')
  }

  const handleScreenTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isConnected) return
    
    const rect = screenRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    
    // Add touch point visualization
    const newPoint: TouchPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: touchIdRef.current++ }
    setTouchPoints(prev => [...prev, newPoint])
    setTimeout(() => {
      setTouchPoints(prev => prev.filter(p => p.id !== newPoint.id))
    }, 600)
    
    logAction(`Tap at (${x}%, ${y}%)`, 'tap')
  }

  const handleSwipe = (direction: string) => {
    if (!isConnected) return
    logAction(`Swipe ${direction}`, 'swipe')
  }

  const handleButton = (button: string) => {
    if (!isConnected && button !== 'power') return
    
    switch (button) {
      case 'home':
        setCurrentScreen('home')
        logAction('Home button pressed', 'button')
        break
      case 'back':
        logAction('Back button pressed', 'button')
        break
      case 'recent':
        setCurrentScreen('recent')
        logAction('Recent apps opened', 'button')
        break
      case 'power':
        handleConnect()
        break
      case 'volume-up':
        setVolume(prev => Math.min(100, prev + 10))
        logAction(`Volume up: ${Math.min(100, volume + 10)}%`, 'button')
        break
      case 'volume-down':
        setVolume(prev => Math.max(0, prev - 10))
        logAction(`Volume down: ${Math.max(0, volume - 10)}%`, 'button')
        break
    }
  }

  const handleAICommand = () => {
    if (!commandInput.trim() || !isConnected) return
    
    const cmd = commandInput.toLowerCase()
    logAction(`AI Command: "${commandInput}"`, 'command')
    
    // Simulate AI understanding commands
    if (cmd.includes('open') && cmd.includes('camera')) {
      setCurrentScreen('camera')
      logAction('Opening Camera app...', 'command')
    } else if (cmd.includes('go home') || cmd.includes('home screen')) {
      setCurrentScreen('home')
      logAction('Navigating to home screen...', 'command')
    } else if (cmd.includes('screenshot')) {
      logAction('Taking screenshot...', 'command')
    } else if (cmd.includes('brightness')) {
      if (cmd.includes('max') || cmd.includes('full')) {
        setBrightness(100)
        logAction('Brightness set to 100%', 'command')
      } else if (cmd.includes('low') || cmd.includes('dim')) {
        setBrightness(30)
        logAction('Brightness set to 30%', 'command')
      }
    } else if (cmd.includes('volume')) {
      if (cmd.includes('mute') || cmd.includes('silent')) {
        setVolume(0)
        logAction('Volume muted', 'command')
      } else if (cmd.includes('max') || cmd.includes('full')) {
        setVolume(100)
        logAction('Volume set to 100%', 'command')
      }
    } else if (cmd.includes('settings')) {
      setCurrentScreen('settings')
      logAction('Opening Settings...', 'command')
    } else if (cmd.includes('message') || cmd.includes('text')) {
      setCurrentScreen('messages')
      logAction('Opening Messages...', 'command')
    } else {
      logAction(`Processing: "${commandInput}"`, 'command')
    }
    
    setCommandInput('')
  }

  const getScreenContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <div className="grid grid-cols-4 gap-3 p-4">
            {['📱 Phone', '💬 Messages', '📷 Camera', '🎵 Music', 
              '⚙️ Settings', '🌐 Browser', '📧 Email', '📅 Calendar',
              '🗺️ Maps', '📝 Notes', '🎮 Games', '🛒 Store'].map((app, i) => (
              <button 
                key={i}
                onClick={() => {
                  if (!isConnected) return
                  const appName = app.split(' ')[1]
                  setCurrentScreen(appName.toLowerCase())
                  logAction(`Opening ${appName}`, 'tap')
                }}
                className="flex flex-col items-center p-2 rounded-xl hover:bg-white/10 transition-all"
              >
                <span className="text-2xl">{app.split(' ')[0]}</span>
                <span className="text-[10px] text-gray-400 mt-1">{app.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        )
      case 'camera':
        return (
          <div className="flex flex-col items-center justify-center h-full bg-black">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-gray-400">Camera Active</p>
            <button 
              onClick={() => logAction('Photo captured!', 'tap')}
              className="mt-4 w-16 h-16 rounded-full bg-white/20 border-4 border-white"
            />
          </div>
        )
      case 'settings':
        return (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-white">Settings</h3>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Brightness</span>
                  <span className="text-gray-400">{brightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={brightness}
                  onChange={(e) => {
                    setBrightness(Number(e.target.value))
                    logAction(`Brightness: ${e.target.value}%`, 'gesture')
                  }}
                  className="w-full mt-2 accent-blue-500"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Volume</span>
                  <span className="text-gray-400">{volume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value))
                    logAction(`Volume: ${e.target.value}%`, 'gesture')
                  }}
                  className="w-full mt-2 accent-blue-500"
                />
              </div>
              <div className="bg-white/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-gray-300">AI Control Mode</span>
                <button 
                  onClick={() => {
                    setAiMode(!aiMode)
                    logAction(`AI Mode: ${!aiMode ? 'ON' : 'OFF'}`, 'command')
                  }}
                  className={`w-12 h-6 rounded-full transition-all ${aiMode ? 'bg-blue-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${aiMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </div>
        )
      case 'messages':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Messages</h3>
            <div className="space-y-2">
              {['Alice', 'Bob', 'Charlie'].map((name, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm">{name}</p>
                    <p className="text-gray-400 text-xs">Tap to open chat...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'recent':
        return (
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Apps</h3>
            <div className="space-y-2">
              {['Camera', 'Settings', 'Messages'].map((app, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-4 flex justify-between items-center">
                  <span className="text-white">{app}</span>
                  <button 
                    onClick={() => logAction(`Closed ${app}`, 'gesture')}
                    className="text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-gray-400">{currentScreen}</p>
            <button 
              onClick={() => setCurrentScreen('home')}
              className="mt-4 text-blue-400 text-sm"
            >
              Back to Home
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-8 animate-slide-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white neon-text">
              Mobile Control Agent
            </h1>
            <p className="text-gray-400 mt-1">AI-Powered Remote Device Control</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'}`} />
            <span className="text-gray-400 text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Phone Display */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="relative">
            {/* Phone Frame */}
            <div className="phone-frame rounded-[3rem] p-2 w-[300px] md:w-[340px]">
              {/* Notch */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10" />
              
              {/* Screen */}
              <div 
                ref={screenRef}
                onClick={handleScreenTap}
                className="relative bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] h-[580px] md:h-[640px] overflow-hidden cursor-pointer"
                style={{ filter: `brightness(${brightness / 100})` }}
              >
                {/* Status Bar */}
                <div className="flex justify-between items-center px-8 py-3 pt-8">
                  <span className="text-white text-xs">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs">📶</span>
                    <span className="text-xs">🔋</span>
                  </div>
                </div>

                {/* Screen Content */}
                <div className="h-full pb-20">
                  {isConnected ? getScreenContent() : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="text-6xl mb-4 animate-pulse-slow">🔒</div>
                      <p className="text-gray-400">Device Locked</p>
                      <p className="text-gray-500 text-sm mt-2">Connect to unlock</p>
                    </div>
                  )}
                </div>

                {/* Touch Points Visualization */}
                {touchPoints.map(point => (
                  <div 
                    key={point.id}
                    className="touch-ripple"
                    style={{ 
                      left: point.x - 25, 
                      top: point.y - 25,
                      width: 50,
                      height: 50
                    }}
                  />
                ))}

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full" />
              </div>
            </div>

            {/* Physical Buttons */}
            <div className="absolute -right-3 top-32 space-y-2">
              <button 
                onClick={() => handleButton('power')}
                className="control-button w-2 h-16 rounded-r-lg"
                title="Power"
              />
            </div>
            <div className="absolute -left-3 top-24 space-y-2">
              <button 
                onClick={() => handleButton('volume-up')}
                className="control-button w-2 h-12 rounded-l-lg"
                title="Volume Up"
              />
              <button 
                onClick={() => handleButton('volume-down')}
                className="control-button w-2 h-12 rounded-l-lg"
                title="Volume Down"
              />
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-4">
          {/* Connection Panel */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🔗</span> Connection
            </h3>
            <button 
              onClick={handleConnect}
              className={`w-full py-3 rounded-xl font-medium transition-all ${
                isConnected 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                  : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
              }`}
            >
              {isConnected ? 'Disconnect Device' : 'Connect Device'}
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🎮</span> Navigation
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleButton('back')}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white"
                disabled={!isConnected}
              >
                ◀ Back
              </button>
              <button 
                onClick={() => handleButton('home')}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white"
                disabled={!isConnected}
              >
                ⬤ Home
              </button>
              <button 
                onClick={() => handleButton('recent')}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white"
                disabled={!isConnected}
              >
                ⬜ Apps
              </button>
            </div>
          </div>

          {/* Gesture Controls */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>👆</span> Gestures
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-start-2">
                <button 
                  onClick={() => handleSwipe('up')}
                  className="control-button w-full p-3 rounded-xl text-gray-400 hover:text-white"
                  disabled={!isConnected}
                >
                  ↑
                </button>
              </div>
              <div className="col-start-1">
                <button 
                  onClick={() => handleSwipe('left')}
                  className="control-button w-full p-3 rounded-xl text-gray-400 hover:text-white"
                  disabled={!isConnected}
                >
                  ←
                </button>
              </div>
              <div>
                <button 
                  onClick={() => logAction('Double tap', 'tap')}
                  className="control-button w-full p-3 rounded-xl text-gray-400 hover:text-white text-xs"
                  disabled={!isConnected}
                >
                  2×
                </button>
              </div>
              <div>
                <button 
                  onClick={() => handleSwipe('right')}
                  className="control-button w-full p-3 rounded-xl text-gray-400 hover:text-white"
                  disabled={!isConnected}
                >
                  →
                </button>
              </div>
              <div className="col-start-2">
                <button 
                  onClick={() => handleSwipe('down')}
                  className="control-button w-full p-3 rounded-xl text-gray-400 hover:text-white"
                  disabled={!isConnected}
                >
                  ↓
                </button>
              </div>
            </div>
          </div>

          {/* AI Command Input */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🤖</span> AI Commands
            </h3>
            <div className="flex gap-2">
              <input 
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
                placeholder="e.g., 'open camera', 'go home'"
                className="flex-1 bg-white/5 border border-gray-700 rounded-xl px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                disabled={!isConnected}
              />
              <button 
                onClick={handleAICommand}
                className="control-button px-4 py-2 rounded-xl text-blue-400 hover:text-blue-300"
                disabled={!isConnected}
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {['open camera', 'go home', 'screenshot', 'settings'].map((cmd, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setCommandInput(cmd)
                    setTimeout(handleAICommand, 100)
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 hover:bg-white/10"
                  disabled={!isConnected}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Action Log */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📋</span> Action Log
              </span>
              <button 
                onClick={() => setIsRecording(!isRecording)}
                className={`text-xs px-2 py-1 rounded ${isRecording ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}
              >
                {isRecording ? '● Recording' : '○ Record'}
              </button>
            </h3>
            <div className="action-log h-40 overflow-y-auto space-y-1">
              {actionLogs.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No actions yet</p>
              ) : (
                actionLogs.map(log => (
                  <div key={log.id} className="flex items-start gap-2 text-xs py-1 border-b border-gray-800">
                    <span className="text-gray-500">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      log.type === 'tap' ? 'bg-blue-500/20 text-blue-400' :
                      log.type === 'swipe' ? 'bg-purple-500/20 text-purple-400' :
                      log.type === 'button' ? 'bg-green-500/20 text-green-400' :
                      log.type === 'command' ? 'bg-cyan-500/20 text-cyan-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {log.type}
                    </span>
                    <span className="text-gray-300 flex-1">{log.action}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="agent-panel rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>⚡</span> Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => {
                  logAction('Screenshot taken', 'command')
                }}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white text-sm"
                disabled={!isConnected}
              >
                📸 Screenshot
              </button>
              <button 
                onClick={() => {
                  setIsRecording(!isRecording)
                  logAction(isRecording ? 'Screen recording stopped' : 'Screen recording started', 'command')
                }}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white text-sm"
                disabled={!isConnected}
              >
                {isRecording ? '⏹ Stop' : '🔴 Record'}
              </button>
              <button 
                onClick={() => {
                  setVolume(0)
                  logAction('Device muted', 'command')
                }}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white text-sm"
                disabled={!isConnected}
              >
                🔇 Mute
              </button>
              <button 
                onClick={() => {
                  logAction('Device locked', 'command')
                  setIsConnected(false)
                }}
                className="control-button p-3 rounded-xl text-gray-400 hover:text-white text-sm"
                disabled={!isConnected}
              >
                🔒 Lock
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8 text-center text-gray-500 text-sm">
        <p>Mobile Control Agent • AI-Powered Remote Control Interface</p>
      </footer>
    </div>
  )
}
