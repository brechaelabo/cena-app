import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LivePublicEvent, EventAudienceType } from '../../types';
import { Button } from '../Common/Button';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, LiveIndicatorIcon, XMarkIcon, UserGroupIcon } from '../Common/Icons';
import { getMonthNameYear, getDaysInMonth, getFirstDayOfMonth } from '../../utils/dateFormatter';
import { EVENT_AUDIENCE_TYPE_NAMES } from '../../constants';

interface PublicEventsCalendarProps {
  publicLiveEvents: LivePublicEvent[];
}

interface CalendarEventItem {
  id: string;
  title: string;
  description: string;
  time: string;
  meetLink?: string;
  audienceType?: EventAudienceType;
}

interface PopoverData {
  dayKey: string; 
  events: CalendarEventItem[];
  top: number;
  left: number;
  pinned: boolean;
}

export const PublicEventsCalendar: React.FC<PublicEventsCalendarProps> = ({ publicLiveEvents }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [popoverData, setPopoverData] = useState<PopoverData | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null); 
  const hidePopoverTimeoutRef = useRef<number | null>(null);


  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); 

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

  const eventsByDayKey = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    publicLiveEvents.forEach(event => {
      if (event.scheduledAt && event.isActive) { 
        const eventDate = new Date(event.scheduledAt);
        const dayKey = `${eventDate.getFullYear()}-${eventDate.getMonth()}-${eventDate.getDate()}`;
        const existingEvents = map.get(dayKey) || [];
        map.set(dayKey, [
          ...existingEvents,
          {
            id: event.id,
            title: event.title,
            description: event.description,
            time: eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            meetLink: event.meetLink,
            audienceType: event.audienceType || EventAudienceType.ALL,
          }
        ].sort((a,b) => a.time.localeCompare(b.time))
        );
      }
    });
    return map;
  }, [publicLiveEvents]);

  const clearHideTimeout = () => {
    if (hidePopoverTimeoutRef.current) {
      clearTimeout(hidePopoverTimeoutRef.current);
      hidePopoverTimeoutRef.current = null;
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setPopoverData(null);
    setExpandedEventId(null); 
    clearHideTimeout();
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setPopoverData(null);
    setExpandedEventId(null); 
    clearHideTimeout();
  };

  const showPopover = (
    day: number,
    month: number, 
    year: number,
    dayEvents: CalendarEventItem[],
    targetElement: HTMLElement,
    isPinned: boolean
  ) => {
    clearHideTimeout();
    if (!calendarRef.current) return;

    const calendarRect = calendarRef.current.getBoundingClientRect();
    const dayCellRect = targetElement.getBoundingClientRect();
    
    let top = dayCellRect.bottom - calendarRect.top + calendarRef.current.scrollTop + 8;
    let left = dayCellRect.left - calendarRect.left + calendarRef.current.scrollLeft;
    
    const popoverEstimatedHeight = 250; 
    const popoverWidth = 288; // w-72 from Tailwind

    if (top + popoverEstimatedHeight > calendarRef.current.scrollTop + calendarRef.current.clientHeight - 16) {
        top = dayCellRect.top - calendarRect.top + calendarRef.current.scrollTop - popoverEstimatedHeight - 8;
        if (top < calendarRef.current.scrollTop + 16) top = calendarRef.current.scrollTop + 16; 
    }
    if (left + popoverWidth > calendarRef.current.scrollLeft + calendarRef.current.clientWidth - 16) {
        left = calendarRef.current.scrollLeft + calendarRef.current.clientWidth - popoverWidth - 16;
    }
    if (left < calendarRef.current.scrollLeft + 16) {
        left = calendarRef.current.scrollLeft + 16;
    }

    if (popoverData?.dayKey !== `${year}-${month}-${day}`) {
        setExpandedEventId(null);
    }

    setPopoverData({
      dayKey: `${year}-${month}-${day}`,
      events: dayEvents,
      top,
      left,
      pinned: isPinned,
    });
  };
  
  const handleDayClick = (day: number, month: number, year: number, targetElement: HTMLElement) => {
    clearHideTimeout();
    const dayKey = `${year}-${month}-${day}`;
    const dayEvents = eventsByDayKey.get(dayKey) || [];

    if (popoverData?.dayKey === dayKey && popoverData.pinned) {
        setPopoverData(null); 
        setExpandedEventId(null);
    } else if (dayEvents.length > 0) {
        showPopover(day, month, year, dayEvents, targetElement, true); 
    } else {
        setPopoverData(null); 
        setExpandedEventId(null);
    }
  };

  const handleDayMouseEnter = (day: number, month: number, year: number, targetElement: HTMLElement) => {
    clearHideTimeout();
    const dayKey = `${year}-${month}-${day}`;
    const dayEvents = eventsByDayKey.get(dayKey) || [];

    if (dayEvents.length > 0) {
        if (popoverData?.pinned && popoverData.dayKey !== dayKey) {
            return; 
        }
        if (popoverData?.pinned && popoverData.dayKey === dayKey) {
            return; 
        }
        showPopover(day, month, year, dayEvents, targetElement, false);
    } else {
        if (popoverData && !popoverData.pinned) {
            hidePopoverTimeoutRef.current = window.setTimeout(() => {
                setPopoverData(null);
                setExpandedEventId(null);
            }, 100);
        }
    }
  };
  
  const handleDayMouseLeave = () => {
    if (popoverData && !popoverData.pinned) {
       hidePopoverTimeoutRef.current = window.setTimeout(() => {
            setPopoverData(null);
            setExpandedEventId(null);
        }, 100);
    }
  };
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverData?.pinned) {
        const popoverEl = document.getElementById('event-details-popover');
        let target = event.target as HTMLElement | null;
        let isCalendarDayButton = false;
        while (target && target !== document.body) {
            if (target.hasAttribute('data-calendar-day')) {
                isCalendarDayButton = true;
                break;
            }
            target = target.parentElement;
        }

        if (popoverEl && !popoverEl.contains(event.target as Node) && !isCalendarDayButton) {
          setPopoverData(null);
          setExpandedEventId(null);
          clearHideTimeout();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        clearHideTimeout();
    };
  }, [popoverData]);


  const weekdayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const calendarCells = [];

  const cellBaseHeight = 'h-12 md:h-14'; 
  const cellPadding = 'p-1.5'; 
  const dayNumberFontSize = 'text-xs md:text-sm';
  const eventDotSize = 'w-1.5 h-1.5';
  const eventDotPosition = 'bottom-1.5';

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-start-${i}`} className={`border-r border-b border-border-subtle ${cellBaseHeight}`}></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayKey = `${currentYear}-${currentMonth}-${day}`;
    const dayEvents = eventsByDayKey.get(dayKey) || [];
    const hasEvent = dayEvents.length > 0;
    const today = new Date();
    const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const isSelectedAndPinned = popoverData?.dayKey === dayKey && popoverData.pinned;

    calendarCells.push(
      <button
        key={day}
        data-calendar-day={dayKey} 
        onClick={(e) => handleDayClick(day, currentMonth, currentYear, e.currentTarget)}
        onMouseEnter={(e) => handleDayMouseEnter(day, currentMonth, currentYear, e.currentTarget)}
        onMouseLeave={handleDayMouseLeave}
        className={`border-r border-b border-border-subtle text-center ${cellBaseHeight} ${cellPadding} focus:outline-none group relative transition-colors duration-150
                    ${isToday ? 'bg-accent-blue-subtle font-semibold' : 'bg-card-bg'} 
                    ${isSelectedAndPinned ? 'ring-2 ring-accent-blue-emphasis z-10' : ''} 
                    ${hasEvent ? 'hover:bg-accent-blue-subtle cursor-pointer' : 'hover:bg-gray-50'}`}
        aria-label={`Dia ${day}${hasEvent ? `, ${dayEvents.length} evento(s)` : ''}`}
      >
        <span className={`${dayNumberFontSize} ${isToday ? 'text-accent-blue-emphasis' : 'text-text-headings'}`}>
          {day}
        </span>
        {hasEvent && (
          <div className={`absolute ${eventDotPosition} left-1/2 transform -translate-x-1/2 ${eventDotSize} rounded-full bg-accent-blue-marker`}>
          </div>
        )}
      </button>
    );
  }

  const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;
  for (let i = (firstDayOfMonth + daysInMonth); i < totalCells; i++) {
    calendarCells.push(<div key={`empty-end-${i}`} className={`border-r border-b border-border-subtle ${cellBaseHeight}`}></div>);
  }


  return (
    <div className="bg-card-bg p-3 md:p-4 rounded-lg shadow-md relative" ref={calendarRef}>
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="sm" onClick={handlePrevMonth} iconOnly aria-label="Mês anterior">
          <ChevronLeftIcon className="w-5 h-5 text-text-muted" />
        </Button>
        <h2 className="text-base md:text-lg font-semibold text-black capitalize">
          {getMonthNameYear(currentDate)}
        </h2>
        <Button variant="ghost" size="sm" onClick={handleNextMonth} iconOnly aria-label="Próximo mês">
          <ChevronRightIcon className="w-5 h-5 text-text-muted" />
        </Button>
      </div>

      <div className="grid grid-cols-7 border-t border-l border-border-subtle">
        {weekdayLabels.map(label => (
          <div key={label} className="text-center py-1.5 text-xs font-medium text-text-muted border-r border-b border-border-subtle bg-gray-50">
            {label}
          </div>
        ))}
        {calendarCells}
      </div>

      {popoverData && (
        <div
          id="event-details-popover"
          style={{
            position: 'absolute', 
            top: `${popoverData.top}px`,
            left: `${popoverData.left}px`,
          }}
          className="z-30 p-3 bg-card-bg bg-opacity-100 shadow-xl rounded-lg border border-border-subtle w-72 text-sm"
          role="dialog"
          aria-modal={popoverData.pinned}
          onMouseEnter={clearHideTimeout} 
          onMouseLeave={() => { 
            if (popoverData && !popoverData.pinned) {
              hidePopoverTimeoutRef.current = window.setTimeout(() => {
                  setPopoverData(null);
                  setExpandedEventId(null);
              }, 100);
            }
          }}
        >
          {popoverData.pinned && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => { setPopoverData(null); setExpandedEventId(null); clearHideTimeout(); }} iconOnly aria-label="Fechar detalhes" className="p-0.5 -mr-1 -mt-1 absolute top-2 right-2">
                    <XMarkIcon className="w-4 h-4 text-text-muted hover:text-red-500"/>
                </Button>
              </div>
            )}
          <ul className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {popoverData.events.map(event => {
              const isExpanded = expandedEventId === event.id;
              const showToggle = event.description.length > 70;

              return (
                <li key={event.id} className="pb-1.5 border-b border-border-subtle last:border-b-0">
                  <p className="font-semibold text-text-headings leading-tight text-sm">{event.title}</p>
                  <p className={`text-xs text-text-body mt-0.5 leading-snug ${!isExpanded ? 'line-clamp-2' : ''}`}>
                    {event.description}
                  </p>
                  {showToggle && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setExpandedEventId(prev => prev === event.id ? null : event.id);
                      }}
                      className="text-xs text-accent-blue-emphasis hover:underline mt-0.5 font-medium"
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                  )}
                  <div className="flex items-center justify-between text-xs mt-1.5 pt-1.5 border-t border-gray-100">
                    <div className="flex items-center text-text-muted">
                      <ClockIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-accent-blue-emphasis" />
                      <span>{event.time}</span>
                    </div>
                    {event.audienceType && (
                        <div className="flex items-center">
                            <UserGroupIcon className="w-3.5 h-3.5 mr-1 text-accent-blue-emphasis flex-shrink-0"/>
                            <span className="px-1.5 py-0.5 bg-gray-100 text-text-muted rounded-full font-medium text-xs">
                                {EVENT_AUDIENCE_TYPE_NAMES[event.audienceType] || 'N/D'}
                            </span>
                        </div>
                    )}
                    {event.meetLink && (
                       <a 
                          href={event.meetLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center text-accent-blue-emphasis hover:underline font-medium text-xs"
                      >
                          <LiveIndicatorIcon className="w-3.5 h-3.5 mr-0.5 flex-shrink-0 text-accent-blue-emphasis" /> Acessar
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
             {popoverData.events.length === 0 && (
                <p className="text-text-muted text-xs">Nenhum evento para este dia.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};