
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

const courses = [
  {
    id: 1,
    title: 'Resume Writing Fundamentals',
    description: 'Learn the essential principles of creating effective resumes that stand out to recruiters.',
    instructor: 'Jane Smith',
    startDate: new Date(2023, 8, 15),
    endDate: new Date(2023, 9, 30),
    status: 'ongoing',
    students: 24,
    image: 'https://images.unsplash.com/photo-1513595207829-9f414c0665f6?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 2,
    title: 'Interview Techniques for Tech Roles',
    description: 'Master the strategies for succeeding in technical interviews at top companies.',
    instructor: 'Michael Wong',
    startDate: new Date(2023, 9, 5),
    endDate: new Date(2023, 10, 15),
    status: 'upcoming',
    students: 18,
    image: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 3,
    title: 'Behavioral Interview Preparation',
    description: 'Develop compelling stories and responses for common behavioral interview questions.',
    instructor: 'Sarah Johnson',
    startDate: new Date(2023, 7, 10),
    endDate: new Date(2023, 8, 5),
    status: 'completed',
    students: 32,
    image: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: 4,
    title: 'Negotiation Skills for Job Offers',
    description: 'Learn effective strategies for negotiating salaries and benefits in job offers.',
    instructor: 'David Chen',
    startDate: new Date(2023, 9, 20),
    endDate: new Date(2023, 10, 25),
    status: 'upcoming',
    students: 15,
    image: 'https://images.unsplash.com/photo-1664575601711-67110e027b9b?q=80&w=500&auto=format&fit=crop'
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ongoing':
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Ongoing</Badge>;
    case 'upcoming':
      return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Upcoming</Badge>;
    case 'completed':
      return <Badge className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

const CourseCard = ({ course }: { course: typeof courses[0] }) => {
  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge(course.status)}
        </div>
      </div>
      
      <CardHeader className="pb-3">
        <CardTitle className="text-xl leading-tight text-balance">{course.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 mt-1">
          <Users size={14} className="text-muted-foreground" />
          <span>Instructor: {course.instructor}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3 flex-1">
        <p className="text-sm text-muted-foreground mb-4">
          {course.description}
        </p>
        
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={14} />
            <span>Start: {format(course.startDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar size={14} />
            <span>End: {format(course.endDate, 'MMM d, yyyy')}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users size={14} />
            <span>{course.students} students</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={14} />
            <span>8 weeks</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 mt-auto">
        <Button variant="outline" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
};

const CoursesPage = () => {
  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
            <p className="text-muted-foreground mt-1">
              Browse available courses and enroll
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <BookOpen size={16} />
            All Courses
          </Button>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
        
        <Card className="glass-card overflow-hidden p-0">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
              <p className="text-sm uppercase font-semibold text-blue-600 tracking-wider mb-2">Coming Soon</p>
              <h3 className="text-2xl font-bold mb-3">Advanced Technical Interview Preparation</h3>
              <p className="text-muted-foreground mb-6">
                Master complex algorithms, system design, and problem-solving techniques required for technical interviews at top tech companies.
              </p>
              <div className="flex items-center gap-2 mb-6">
                <Badge variant="outline">Data Structures</Badge>
                <Badge variant="outline">Algorithms</Badge>
                <Badge variant="outline">System Design</Badge>
              </div>
              <Button>Join Waitlist</Button>
            </div>
            <div className="md:w-1/2 h-60 md:h-auto bg-blue-50">
              <img 
                src="https://images.unsplash.com/photo-1613923550121-584486ef8e2f?q=80&w=2000&auto=format&fit=crop" 
                alt="Technical Interview Preparation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CoursesPage;
