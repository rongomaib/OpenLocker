/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Box, 
  CheckCircle2, 
  Loader2, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  AlertTriangle,
  Unlock,
  Lock,
  Settings,
  X
} from 'lucide-react';

type Screen = 'WELCOME' | 'IDENTIFY' | 'PICKUP_SELECT' | 'DROPOFF_SELECT' | 'DROPOFF_CONFIRM' | 'DROPOFF_ISSUE' | 'LOCKER_ACTIVE' | 'ADMIN' | 'SUCCESS';

type Tool = {
  id: string;
  name: string;
  locker: number;
  selected: boolean;
  condition?: 'Good' | 'Damaged' | 'Lost';
};

type AdminLocker = {
  id: number;
  status: 'Open' | 'Closed';
  tool: string;
  toolId: string | null;
};

const AlotLogo = () => (
  <div className="flex flex-col items-center justify-center w-full px-4 mt-2">
    <div className="text-primary font-black text-[56px] tracking-widest leading-none">
      ALoT
    </div>
    <div className="text-primary font-bold text-[7px] tracking-[0.15em] mt-1 whitespace-nowrap">
      AUCKLAND LIBRARY OF TOOLS
    </div>
    <div className="w-full h-4 bg-accent mt-2 relative flex items-start justify-between px-2 pt-0.5">
      {[...Array(11)].map((_, i) => (
        <div key={i} className={`w-[1px] bg-text ${i % 2 === 0 ? 'h-2' : 'h-1.5'}`}></div>
      ))}
    </div>
  </div>
);

interface LockerItemProps {
  lockerId: number | string;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  showCheckbox?: boolean;
  accentColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

const LockerItem: React.FC<LockerItemProps> = ({ 
  lockerId, 
  title, 
  subtitle, 
  subtitleColor = 'text-text/60',
  isSelected, 
  onSelect, 
  showCheckbox,
  accentColor = 'bg-primary',
  actions,
  className = ""
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`bg-white border-b border-muted flex items-center text-left relative transition-colors ${isSelected ? 'bg-primary/5' : ''} ${onSelect ? 'cursor-pointer active:bg-muted/20' : ''} ${className}`}
    >
      {/* Left Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}></div>
      
      {/* Locker ID */}
      <div className="w-[64px] shrink-0 flex items-center justify-center pl-1">
        <span className="text-[24px] font-black text-primary tracking-tighter">
          L-{String(lockerId).padStart(2, '0')}
        </span>
      </div>

      {/* Tool Info */}
      <div className="flex-1 py-1.5 px-2 overflow-hidden border-l border-muted/30">
        <div className="text-[11px] font-black uppercase leading-tight truncate">
          {title}
        </div>
        <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${subtitleColor}`}>
          {subtitle}
        </div>
      </div>

      {/* Actions */}
      <div className="pr-2 pl-1 flex items-center gap-1">
        {showCheckbox && (
          <div className="p-1">
            {isSelected ? <CheckSquare className="text-primary" size={20} /> : <Square className="text-muted" size={20} />}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};

interface LockerItemProps {
  lockerId: number | string;
  title: string;
  subtitle: string;
  subtitleColor?: string;
  isSelected?: boolean;
  onSelect?: () => void;
  showCheckbox?: boolean;
  accentColor?: string;
  actions?: React.ReactNode;
  className?: string;
}

const LockerItem: React.FC<LockerItemProps> = ({ 
  lockerId, 
  title, 
  subtitle, 
  subtitleColor = 'text-text/60',
  isSelected, 
  onSelect, 
  showCheckbox,
  accentColor = 'bg-primary',
  actions,
  className = ""
}) => {
  return (
    <div 
      onClick={onSelect}
      className={`bg-white border-b border-muted flex items-center text-left relative transition-colors ${isSelected ? 'bg-primary/5' : ''} ${onSelect ? 'cursor-pointer active:bg-muted/20' : ''} ${className}`}
    >
      {/* Left Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}></div>
      
      {/* Locker ID */}
      <div className="w-[64px] shrink-0 flex items-center justify-center pl-1">
        <span className="text-[24px] font-black text-primary tracking-tighter">
          L-{String(lockerId).padStart(2, '0')}
        </span>
      </div>

      {/* Tool Info */}
      <div className="flex-1 py-1.5 px-2 overflow-hidden border-l border-muted/30">
        <div className="text-[11px] font-black uppercase leading-tight truncate">
          {title}
        </div>
        <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${subtitleColor}`}>
          {subtitle}
        </div>
      </div>

      {/* Actions */}
      <div className="pr-2 pl-1 flex items-center gap-1">
        {showCheckbox && (
          <div className="p-1">
            {isSelected ? <CheckSquare className="text-primary" size={20} /> : <Square className="text-muted" size={20} />}
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('WELCOME');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [action, setAction] = useState<'PICKUP' | 'RETURN' | 'ADMIN' | null>(null);
  const [doorClosed, setDoorClosed] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);
  const [currentReturnIndex, setCurrentReturnIndex] = useState(0);
  const [unlockedLockers, setUnlockedLockers] = useState<number[]>([]);

  // Mock Data
  const [pickupTools, setPickupTools] = useState<Tool[]>([
    { id: 'T-101', name: 'Power Drill', locker: 1, selected: true },
    { id: 'T-102', name: 'Circular Saw', locker: 2, selected: true },
    { id: 'T-103', name: 'Sander', locker: 3, selected: true },
    { id: 'T-104', name: 'Jigsaw', locker: 4, selected: true },
    { id: 'T-105', name: 'Angle Grinder', locker: 5, selected: true },
    { id: 'T-106', name: 'Impact Driver', locker: 6, selected: true },
    { id: 'T-107', name: 'Laser Level', locker: 7, selected: true },
  ]);

  const [dropoffTools, setDropoffTools] = useState<Tool[]>([
    { id: 'T-201', name: 'Hammer Drill', locker: 1, selected: false, condition: 'Good' },
    { id: 'T-202', name: 'Router', locker: 2, selected: false, condition: 'Good' },
    { id: 'T-203', name: 'Heat Gun', locker: 3, selected: false, condition: 'Good' },
    { id: 'T-204', name: 'Stud Finder', locker: 4, selected: false, condition: 'Good' },
  ]);
  const [activeIssueTool, setActiveIssueTool] = useState<Tool | null>(null);

  const [adminLockers, setAdminLockers] = useState<AdminLocker[]>([
    { id: 1, status: 'Closed', tool: 'Hammer Drill', toolId: 'T-201' },
    { id: 2, status: 'Closed', tool: 'Router', toolId: 'T-202' },
    { id: 3, status: 'Open', tool: 'Empty', toolId: null },
    { id: 4, status: 'Closed', tool: 'Empty', toolId: null },
    { id: 5, status: 'Closed', tool: 'Angle Grinder', toolId: 'T-105' },
    { id: 6, status: 'Closed', tool: 'Impact Driver', toolId: 'T-106' },
  ]);

  // Auto-submit PIN
  useEffect(() => {
    if (pin.length === 4) {
      handlePinSubmit();
    }
  }, [pin]);

  const handlePinSubmit = async () => {
    setIsLoading(true);
    setError(null);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (pin === '1111') {
      setAction('PICKUP');
      setCurrentScreen('PICKUP_SELECT');
    } else if (pin === '2222') {
      setAction('RETURN');
      setCurrentScreen('DROPOFF_SELECT');
    } else if (pin === '9999') {
      setAction('ADMIN');
      setCurrentScreen('ADMIN');
    } else {
      setError('Invalid PIN');
      setPin('');
    }
    setIsLoading(false);
  };

  const proceedToLockers = async () => {
    const tools = getActiveTools();
    setCurrentScreen('LOCKER_ACTIVE');
    setDoorClosed(false);
    setUnlockedLockers([]);
    
    // Sequential opening via Backend API
    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      try {
        const response = await fetch('/api/locker/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lockerId: tool.locker })
        });
        
        if (!response.ok) {
           const errorText = await response.text();
           throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
           const HTMLtext = await response.text();
           throw new Error(`Expected JSON but got ${contentType}. Response: ${HTMLtext.substring(0,20)}...`);
        }
        
        const result = await response.json();
        console.log(`Locker ${tool.locker} unlock result:`, result);
        setUnlockedLockers(prev => [...prev, tool.locker]);
      } catch (err) {
        console.error(`Failed to unlock locker ${tool.locker}:`, err);
      }
      // Small delay between commands to avoid RS485 bus collision
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Mock hardware sensor: doors close automatically after a period
    setTimeout(() => {
      setDoorClosed(true);
    }, 6000);
  };

  const startReturnFlow = () => {
    setCurrentReturnIndex(0);
    setCurrentScreen('DROPOFF_CONFIRM');
  };

  useEffect(() => {
    if (currentScreen === 'LOCKER_ACTIVE' && doorClosed) {
      const timer = setTimeout(() => {
        setCurrentScreen('SUCCESS');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, doorClosed]);

  useEffect(() => {
    if (currentScreen === 'SUCCESS') {
      setSyncProgress(100);
      const interval = setInterval(() => {
        setSyncProgress(prev => Math.max(0, prev - 2));
      }, 100);
      
      const timer = setTimeout(() => {
        resetApp();
      }, 5000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [currentScreen]);

  const resetApp = () => {
    setCurrentScreen('WELCOME');
    setPin('');
    setError(null);
    setAction(null);
    setDoorClosed(false);
    // Reset selections
    setPickupTools(pickupTools.map(t => ({ ...t, selected: true })));
    setDropoffTools(dropoffTools.map(t => ({ ...t, selected: false, condition: 'Good' })));
  };

  const addDigit = (digit: string) => {
    if (pin.length < 4) setPin(prev => prev + digit);
  };

  const removeDigit = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const scrollList = (id: string, direction: 'up' | 'down') => {
    const list = document.getElementById(id);
    if (list) {
      list.scrollBy({ top: direction === 'down' ? 120 : -120, behavior: 'smooth' });
    }
  };

  const springTransition = { type: "spring", stiffness: 300, damping: 30 };

  const getActiveTools = () => {
    return action === 'PICKUP' 
      ? pickupTools.filter(t => t.selected)
      : dropoffTools.filter(t => t.selected);
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-8 rounded-none shadow-2xl border-4 border-gray-700 relative">
      {/* Hardware Bezel Details */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-none border border-gray-700"></div>
      
      {/* The 240x320 Screen */}
      <div className="w-[240px] h-[320px] bg-background relative overflow-hidden flex flex-col select-none rounded-none border-2 border-gray-900">
        <AnimatePresence mode="wait">
          
          {/* WELCOME SCREEN */}
          {currentScreen === 'WELCOME' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background flex flex-col items-center justify-between p-4 text-center"
              onClick={() => setCurrentScreen('IDENTIFY')}
            >
              <AlotLogo />
              <div className="flex flex-col items-center w-full">
                <motion.button
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-full h-16 bg-primary text-white text-xl font-extrabold rounded-none shadow-chunky active:shadow-chunky-active"
                >
                  Tap to Start
                </motion.button>
              </div>
              <div className="text-[10px] font-bold text-muted flex items-center gap-2">
                <span>Admin: 9999 | Pickup: 1111 | Drop: 2222</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </motion.div>
          )}

          {/* IDENTIFY SCREEN */}
          {currentScreen === 'IDENTIFY' && (
            <motion.div
              key="identify"
              initial={{ x: 240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col p-2"
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <button onClick={resetApp} className="p-1">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold">Enter PIN</span>
                <div className="w-5" />
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={error ? { x: [0, -5, 5, -5, 5, 0] } : {}}
                    className={`w-4 h-4 rounded-none border-2 border-muted ${
                      pin.length > i ? 'bg-primary border-primary' : 'bg-white'
                    }`}
                  />
                ))}
              </div>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="animate-spin text-primary" size={40} />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 flex-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        if (key === 'C') setPin('');
                        else if (key === '⌫') removeDigit();
                        else addDigit(key);
                      }}
                      className="bg-white font-extrabold text-lg rounded-none shadow-chunky active:shadow-chunky-active flex items-center justify-center h-12"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}
              
              {error && (
                <p className="text-primary text-xs font-bold text-center mt-2">{error}</p>
              )}
            </motion.div>
          )}

          {/* PICKUP SELECT SCREEN */}
          {currentScreen === 'PICKUP_SELECT' && (
            <motion.div
              key="pickup"
              initial={{ x: 240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col p-2"
            >
              <div className="flex items-center justify-between mb-2 shrink-0">
                <button onClick={resetApp} className="p-1"><ChevronLeft size={20} /></button>
                <span className="text-sm font-extrabold">Pick Up Tools</span>
                <div className="w-5" />
              </div>
              
              <div className="relative flex-1 min-h-0">
                <div id="pickup-list" className="h-full overflow-y-auto px-0 pb-2">
                  {pickupTools.map(tool => (
                    <LockerItem
                      key={tool.id}
                      lockerId={tool.locker}
                      title={tool.name}
                      subtitle={tool.id}
                      isSelected={tool.selected}
                      showCheckbox={true}
                      onSelect={() => {
                        setPickupTools(pickupTools.map(t => t.id === tool.id ? { ...t, selected: !t.selected } : t));
                      }}
                    />
                  ))}
                </div>
                {/* Scroll Controls */}
                <div className="absolute bottom-1 right-1 flex flex-col gap-1 z-10">
                  <button onClick={() => scrollList('pickup-list', 'up')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronUp size={20}/></button>
                  <button onClick={() => scrollList('pickup-list', 'down')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronDown size={20}/></button>
                </div>
              </div>

              <div className="pt-2 border-t border-muted flex flex-col gap-2 shrink-0">
                <button 
                  onClick={() => {
                    const allSelected = pickupTools.every(t => t.selected);
                    setPickupTools(pickupTools.map(t => ({ ...t, selected: !allSelected })));
                  }}
                  className="text-xs font-bold text-text underline text-center"
                >
                  {pickupTools.every(t => t.selected) ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  disabled={!pickupTools.some(t => t.selected)}
                  onClick={proceedToLockers}
                  className="w-full bg-primary text-white font-extrabold py-3 rounded-none shadow-chunky active:shadow-chunky-active disabled:opacity-50 disabled:shadow-none"
                >
                  Unlock {pickupTools.filter(t => t.selected).length} Units
                </button>
              </div>
            </motion.div>
          )}

          {/* DROPOFF SELECT SCREEN */}
          {currentScreen === 'DROPOFF_SELECT' && (
            <motion.div
              key="dropoff"
              initial={{ x: 240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col p-2"
            >
              <div className="flex items-center justify-between mb-2 shrink-0">
                <button onClick={resetApp} className="p-1"><ChevronLeft size={20} /></button>
                <span className="text-sm font-extrabold">Return Tools</span>
                <div className="w-5" />
              </div>
              
              <div className="relative flex-1 min-h-0">
                <div id="dropoff-list" className="h-full overflow-y-auto px-0 pb-2">
                  {dropoffTools.map(tool => (
                    <LockerItem
                      key={tool.id}
                      lockerId={tool.locker}
                      title={tool.name}
                      subtitle={tool.condition === 'Good' ? tool.id : tool.condition}
                      subtitleColor={tool.condition !== 'Good' ? 'text-primary' : 'text-text/60'}
                      isSelected={tool.selected}
                      showCheckbox={true}
                      onSelect={() => setDropoffTools(dropoffTools.map(t => t.id === tool.id ? { ...t, selected: !t.selected } : t))}
                      actions={
                        <button 
                          onClick={(e) => { e.stopPropagation(); setActiveIssueTool(tool); setCurrentScreen('DROPOFF_ISSUE'); }}
                          className="p-2 bg-background rounded-none border border-muted active:bg-muted/30"
                        >
                          <AlertTriangle size={16} className={tool.condition !== 'Good' ? 'text-primary' : 'text-text'} />
                        </button>
                      }
                    />
                  ))}
                </div>
                {/* Scroll Controls */}
                <div className="absolute bottom-1 right-1 flex flex-col gap-1 z-10">
                  <button onClick={() => scrollList('dropoff-list', 'up')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronUp size={20}/></button>
                  <button onClick={() => scrollList('dropoff-list', 'down')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronDown size={20}/></button>
                </div>
              </div>

              <div className="pt-2 border-t border-muted shrink-0">
                <button
                  disabled={!dropoffTools.some(t => t.selected)}
                  onClick={startReturnFlow}
                  className="w-full bg-primary text-white font-extrabold py-3 rounded-none shadow-chunky active:shadow-chunky-active disabled:opacity-50 disabled:shadow-none"
                >
                  Return {dropoffTools.filter(t => t.selected).length} Tools
                </button>
              </div>
            </motion.div>
          )}

          {/* DROPOFF CONFIRM (ITEM BY ITEM) */}
          {currentScreen === 'DROPOFF_CONFIRM' && (
            <motion.div
              key="dropoff-confirm"
              initial={{ x: 240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col p-4"
            >
              <div className="flex items-center justify-between mb-2 shrink-0">
                <button onClick={() => setCurrentScreen('DROPOFF_SELECT')} className="p-1"><ChevronLeft size={20} /></button>
                <span className="text-sm font-extrabold">Step {currentReturnIndex + 1} of {dropoffTools.filter(t => t.selected).length}</span>
                <div className="w-5" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center py-1">
                <div className="mb-2">
                  <span className="text-5xl font-black text-primary">L-{String(dropoffTools.filter(t => t.selected)[currentReturnIndex].locker).padStart(2, '0')}</span>
                </div>
                <h3 className="text-base font-black leading-tight mb-1">
                  Place in L-{String(dropoffTools.filter(t => t.selected)[currentReturnIndex].locker).padStart(2, '0')}
                </h3>
                <p className="text-xs font-bold text-text/70 mb-4 px-2 line-clamp-2">
                  {dropoffTools.filter(t => t.selected)[currentReturnIndex].name}
                </p>

                {dropoffTools.filter(t => t.selected)[currentReturnIndex].condition !== 'Good' && (
                  <div className="mb-4 flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 border border-primary/20">
                    <AlertTriangle size={14} className="text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase">Reported: {dropoffTools.filter(t => t.selected)[currentReturnIndex].condition}</span>
                  </div>
                )}

                <div className="w-full space-y-2">
                  <button
                    onClick={() => {
                      const selectedTools = dropoffTools.filter(t => t.selected);
                      if (currentReturnIndex < selectedTools.length - 1) {
                        setCurrentReturnIndex(prev => prev + 1);
                      } else {
                        proceedToLockers();
                      }
                    }}
                    className="w-full bg-green-600 text-white font-extrabold py-3 rounded-none shadow-chunky active:shadow-chunky-active flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 size={18} /> {dropoffTools.filter(t => t.selected)[currentReturnIndex].condition === 'Good' ? "I've put it back" : "Confirm Return"}
                  </button>
                  
                  <button
                    onClick={() => {
                      setActiveIssueTool(dropoffTools.filter(t => t.selected)[currentReturnIndex]);
                      setCurrentScreen('DROPOFF_ISSUE');
                    }}
                    className="w-full bg-white border-2 border-primary text-primary font-bold py-2 rounded-none flex items-center justify-center gap-2 text-xs"
                  >
                    <AlertTriangle size={16} /> Report a problem
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* DROPOFF ISSUE MODAL */}
          {currentScreen === 'DROPOFF_ISSUE' && activeIssueTool && (
            <motion.div
              key="issue"
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: 320 }}
              transition={springTransition}
              className="absolute inset-0 bg-background z-20 flex flex-col p-4"
            >
              <h3 className="text-lg font-extrabold mb-1">Report Issue</h3>
              <p className="text-xs font-bold text-text/70 mb-4">{activeIssueTool.name}</p>
              
              <div className="space-y-3 flex-1">
                {['Damaged', 'Lost'].map((cond) => (
                  <button
                    key={cond}
                    onClick={() => {
                      setDropoffTools(dropoffTools.map(t => 
                        t.id === activeIssueTool.id ? { ...t, condition: cond as any, selected: true } : t
                      ));
                      // If the tool being reported is the one currently in the confirm flow, go back to confirm
                      const selectedTools = dropoffTools.filter(t => t.selected);
                      const isCurrentConfirmTool = action === 'RETURN' && selectedTools[currentReturnIndex]?.id === activeIssueTool.id;
                      
                      if (isCurrentConfirmTool) {
                         setCurrentScreen('DROPOFF_CONFIRM');
                      } else {
                        setCurrentScreen('DROPOFF_SELECT');
                      }
                    }}
                    className={`w-full py-3 rounded-none font-bold shadow-sm border-2 ${activeIssueTool.condition === cond ? 'border-primary bg-primary/10 text-primary' : 'border-muted bg-white'}`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setCurrentScreen('DROPOFF_SELECT')}
                className="w-full py-3 font-bold text-text underline shrink-0"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* LOCKER ACTIVE SCREEN */}
          {currentScreen === 'LOCKER_ACTIVE' && (
            <motion.div
              key="locker"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col items-center p-2 text-center"
            >
              <h2 className="text-xl font-extrabold text-primary mb-1 mt-2 shrink-0">
                {action === 'PICKUP' ? 'Units Unlocked' : 'Tools Returned'}
              </h2>
              <p className="text-xs font-bold mb-4 shrink-0 px-4">
                {doorClosed ? "Syncing..." : (action === 'PICKUP' ? "Take your tools and close doors." : "Please ensure all doors are closed firmly.")}
              </p>
              
              <div className="relative flex-1 w-full min-h-0">
                <div id="active-list" className="h-full overflow-y-auto px-0 pb-2">
                  {getActiveTools().map(t => (
                    <LockerItem
                      key={t.id}
                      lockerId={t.locker}
                      title={t.name}
                      subtitle="ASSIGNED"
                      subtitleColor="text-green-600"
                      actions={
                        <div className="pr-1">
                          {doorClosed ? (
                            <div className="text-text/40"><Lock size={18} /></div>
                          ) : (
                            unlockedLockers.includes(t.locker) ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-green-600"
                              >
                                <Unlock size={18} />
                              </motion.div>
                            ) : (
                              <div className="text-muted"><Lock size={18} /></div>
                            )
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
                {/* Scroll Controls */}
                <div className="absolute bottom-1 right-1 flex flex-col gap-1 z-10">
                  <button onClick={() => scrollList('active-list', 'up')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronUp size={20}/></button>
                  <button onClick={() => scrollList('active-list', 'down')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronDown size={20}/></button>
                </div>
              </div>

              <div className="w-full pt-2 mt-2 border-t border-muted shrink-0">
                <button onClick={resetApp} className="text-muted text-xs font-bold underline py-2">
                  Cancel Transaction
                </button>
              </div>
            </motion.div>
          )}

          {/* ADMIN SCREEN */}
          {currentScreen === 'ADMIN' && (
            <motion.div
              key="admin"
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: -320 }}
              transition={springTransition}
              className="absolute inset-0 bg-background flex flex-col p-2"
            >
              <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <span className="text-sm font-extrabold">Admin</span>
                <button onClick={resetApp} className="p-1"><X size={20} /></button>
              </div>

              <button className="w-full bg-primary text-white font-extrabold py-2.5 rounded-none shadow-chunky active:shadow-chunky-active mb-3 flex items-center justify-center gap-2 text-sm shrink-0">
                <Unlock size={16} /> Open All Units
              </button>

              <div className="text-[10px] font-black text-text/60 uppercase tracking-[0.15em] mb-1 px-1">
                Locker Allocation
              </div>

              <div className="relative flex-1 min-h-0">
                <div id="admin-list" className="h-full overflow-y-auto px-0 pb-2">
                  {adminLockers.map(l => (
                    <LockerItem
                      key={l.id}
                      lockerId={l.id}
                      title={l.tool}
                      subtitle={l.toolId ? 'ASSIGNED' : 'MAINTENANCE'}
                      subtitleColor={l.toolId ? 'text-green-600' : 'text-primary'}
                      accentColor={l.toolId ? 'bg-primary' : 'bg-muted'}
                      actions={
                        <button className="w-10 h-8 bg-gray-800 text-white text-[9px] font-black flex items-center justify-center active:bg-black rounded-none">
                          {l.toolId ? 'EDIT' : 'FIX'}
                        </button>
                      }
                    />
                  ))}
                </div>
                {/* Scroll Controls */}
                <div className="absolute bottom-1 right-1 flex flex-col gap-1 z-10">
                  <button onClick={() => scrollList('admin-list', 'up')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronUp size={20}/></button>
                  <button onClick={() => scrollList('admin-list', 'down')} className="w-8 h-8 bg-gray-800 text-white rounded-none flex items-center justify-center shadow-sm opacity-80 active:opacity-100"><ChevronDown size={20}/></button>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUCCESS SCREEN */}
          {currentScreen === 'SUCCESS' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={springTransition}
              className="absolute inset-0 bg-accent/10 flex flex-col items-center justify-center p-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mb-4"
              >
                <CheckCircle2 size={80} className="text-accent" />
              </motion.div>
              
              <h2 className="text-2xl font-extrabold mb-2">Success!</h2>
              <p className="text-sm font-bold mb-8">All set! MyTurn updated.</p>

              <div className="absolute bottom-0 left-0 w-full h-6 bg-white border-t border-muted">
                <div className="absolute top-0 left-0 h-1 bg-accent transition-all duration-100" style={{ width: `${syncProgress}%` }} />
                <div className="w-full h-full ruler-bg opacity-50" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

