
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

// Mock attendance data
const mockAttendance = [
  { date: new Date(2023, 7, 1), status: 'present' },
  { date: new Date(2023, 7, 2), status: 'present' },
  { date: new Date(2023, 7, 3), status: 'present' },
  { date: new Date(2023, 7, 4), status: 'absent' },
  { date: new Date(2023, 7, 7), status: 'present' },
  { date: new Date(2023, 7, 8), status: 'present' },
  { date: new Date(2023, 7, 9), status: 'late' },
  { date: new Date(2023, 7, 10), status: 'present' },
  { date: new Date(2023, 7, 11), status: 'present' },
  { date: new Date(2023, 7, 14), status: 'present' },
  { date: new Date(2023, 7, 15), status: 'present' },
  { date: new Date(2023, 7, 16), status: 'present' },
  { date: new Date(2023, 7, 17), status: 'late' },
  { date: new Date(2023, 7, 18), status: 'present' },
  { date: new Date(2023, 7, 21), status: 'present' },
  { date: new Date(2023, 7, 22), status: 'present' },
  { date: new Date(2023, 7, 23), status: 'present' },
  { date: new Date(2023, 7, 24), status: 'present' },
  { date: new Date(2023, 7, 25), status: 'absent' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'absent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'late':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const AttendancePage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2023, 7, 1));
  
  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getAttendanceForDate = (date: Date) => {
    return mockAttendance.find(record => isSameDay(record.date, date));
  };
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const attendanceStats = {
    present: mockAttendance.filter(a => a.status === 'present').length,
    absent: mockAttendance.filter(a => a.status === 'absent').length,
    late: mockAttendance.filter(a => a.status === 'late').length,
    total: mockAttendance.length,
  };

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground mt-1">
            View and manage attendance records
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.present}</div>
              <div className="text-xs text-muted-foreground">
                {((attendanceStats.present / attendanceStats.total) * 100).toFixed(1)}% of total days
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.absent}</div>
              <div className="text-xs text-muted-foreground">
                {((attendanceStats.absent / attendanceStats.total) * 100).toFixed(1)}% of total days
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.late}</div>
              <div className="text-xs text-muted-foreground">
                {((attendanceStats.late / attendanceStats.total) * 100).toFixed(1)}% of total days
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">
                Including late arrivals
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Calendar</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft size={16} />
                </Button>
                <div className="w-32 text-center font-medium">
                  {format(currentMonth, 'MMMM yyyy')}
                </div>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {weekdays.map(day => (
                <div key={day} className="text-center text-sm font-medium pb-2">
                  {day}
                </div>
              ))}
              
              {days.map((day, i) => {
                const attendance = getAttendanceForDate(day);
                const dayOfMonth = format(day, 'd');
                const dayOfWeek = format(day, 'E');
                const isWeekend = dayOfWeek === 'Sat' || dayOfWeek === 'Sun';
                
                return (
                  <div
                    key={i}
                    className={`border rounded-md p-2 min-h-[70px] ${
                      isWeekend ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="text-sm font-medium">{dayOfMonth}</div>
                    {attendance ? (
                      <Badge className={`mt-2 ${getStatusColor(attendance.status)}`}>
                        {attendance.status}
                      </Badge>
                    ) : (
                      isWeekend && <span className="text-xs text-muted-foreground">Weekend</span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAttendance.slice(-5).reverse().map((record, i) => (
                <div key={i} className="flex items-center justify-between animate-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-foreground/80" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">John Doe</p>
                      <p className="text-xs text-muted-foreground">
                        {format(record.date, 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="text-sm">09:00 AM</span>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AttendancePage;
